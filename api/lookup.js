// Delete credit yapit anj
const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

function readJSON(fileName) {
    try {
        const filePath = path.join(__dirname, "../data", fileName);
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
        console.error(`Gagal membaca ${fileName}:`, error.message);
        return [];
    }
}

const provinces = readJSON("provinces.json");
const regencies = readJSON("regencies.json");
const districts = readJSON("districts.json");

function parseNIK(nik) {
    if (!/^\d{16}$/.test(nik)) return null;

    let kodeKab = nik.substring(0, 4);
    let kodeKec = nik.substring(0, 6);
    let tgl = parseInt(nik.substring(6, 8), 10);
    let bulan = nik.substring(8, 10);
    let tahun = nik.substring(10, 12);
    let nomorUrut = nik.substring(12, 16);

    if (tgl > 40) tgl -= 40;
    let tahunLengkap = parseInt(tahun) < 25 ? `20${tahun}` : `19${tahun}`;

    let umur = new Date().getFullYear() - parseInt(tahunLengkap);
    let provinsi = provinces.find((p) => p.code.startsWith(kodeKab)) || { name: "Tidak ditemukan" };
    let kabupaten = regencies.find((r) => r.code.startsWith(kodeKab)) || { name: "Tidak ditemukan" };
    let kecamatan = districts.find((d) => d.code.startsWith(kodeKec)) || { name: "Tidak ditemukan" };

    return {
        Nik: nik,
        Kabupaten: kabupaten.name,
        Kecamatan: kecamatan.name,
        Provinsi: provinsi.name,
        Info: {
            TanggalLahir: `${tgl}-${bulan}-${tahunLengkap}`,
            Umur: `${umur} tahun`,
            NomorUrut: nomorUrut,
        },
    };
}

router.get("/lookup", (req, res) => {
    let { nik } = req.query;
    if (!nik) return res.status(400).json({ status: "error", message: "Masukkan parameter ?nik=16_digit" });

    let result = parseNIK(nik);
    if (!result) return res.status(400).json({ status: "error", message: "NIK tidak valid" });

    res.json({ status: "success", creator: "Aortadev", data: result });
});

module.exports = router;
