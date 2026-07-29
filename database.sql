-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for inventory_workshop
CREATE DATABASE IF NOT EXISTS `inventory_workshop` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `inventory_workshop`;

-- Dumping structure for table inventory_workshop.barang
CREATE TABLE IF NOT EXISTS `barang` (
  `id` int NOT NULL AUTO_INCREMENT,
  `kode_barang` varchar(50) DEFAULT NULL,
  `nama_barang` varchar(150) NOT NULL,
  `quantity` int DEFAULT '1',
  `merk` varchar(100) DEFAULT NULL,
  `tipe` varchar(100) DEFAULT NULL,
  `part_number` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `nomor_inventaris_ga` varchar(100) DEFAULT NULL,
  `program_project` varchar(150) DEFAULT NULL,
  `status` enum('-','Dibeli','Dikirim','Dipasang','Didaftarkan','Disimpan','Dipakai','Dipinjam','Dikembalikan','Diperbaiki','Rusak','Hilang','Dibuang','Dijual') DEFAULT 'Dibeli',
  `kondisi` enum('Rusak Ringan','Rusak Berat','Baru','Bekas','Siap Pakai','Full','Kosong','Belum Siap') DEFAULT NULL,
  `lokasi` varchar(150) DEFAULT NULL,
  `catatan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `foto_kelengkapan` varchar(255) DEFAULT NULL,
  `foto_label_inventaris` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.barang: ~0 rows (approximately)

-- Dumping structure for table inventory_workshop.booking_ruangan
CREATE TABLE IF NOT EXISTS `booking_ruangan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ruangan_id` int NOT NULL,
  `user_id` int NOT NULL,
  `tanggal` date NOT NULL,
  `jam_mulai` time NOT NULL,
  `jam_selesai` time NOT NULL,
  `keperluan` text,
  `status` enum('Menunggu','Disetujui','Ditolak') DEFAULT 'Menunggu',
  `approved_by` int DEFAULT NULL,
  `diajukan_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `ruangan_id` (`ruangan_id`),
  KEY `user_id` (`user_id`),
  KEY `approved_by` (`approved_by`),
  CONSTRAINT `booking_ruangan_ibfk_1` FOREIGN KEY (`ruangan_id`) REFERENCES `ruangan` (`id`),
  CONSTRAINT `booking_ruangan_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `booking_ruangan_ibfk_3` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.booking_ruangan: ~2 rows (approximately)
INSERT INTO `booking_ruangan` (`id`, `ruangan_id`, `user_id`, `tanggal`, `jam_mulai`, `jam_selesai`, `keperluan`, `status`, `approved_by`, `diajukan_pada`) VALUES
	(1, 1, 1, '2026-07-20', '09:00:00', '11:00:00', 'Rapat testing', 'Disetujui', 1, '2026-07-16 03:11:49'),
	(2, 1, 1, '2026-07-20', '13:00:00', '14:00:00', 'Test non-bentrok', 'Disetujui', 1, '2026-07-16 03:14:15');

-- Dumping structure for table inventory_workshop.log_transaksi
CREATE TABLE IF NOT EXISTS `log_transaksi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_id` int DEFAULT NULL,
  `nama_barang_snapshot` varchar(150) DEFAULT NULL,
  `penanggung_jawab` varchar(255) DEFAULT NULL,
  `aktivitas` varchar(50) NOT NULL,
  `lokasi` varchar(150) DEFAULT NULL,
  `program_project` varchar(150) DEFAULT NULL,
  `kondisi` varchar(50) DEFAULT NULL,
  `tanggal` datetime NOT NULL,
  `remark` text,
  PRIMARY KEY (`id`),
  KEY `user_id` (`penanggung_jawab`),
  KEY `log_transaksi_ibfk_1` (`barang_id`),
  CONSTRAINT `log_transaksi_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.log_transaksi: ~0 rows (approximately)

-- Dumping structure for table inventory_workshop.peminjaman
CREATE TABLE IF NOT EXISTS `peminjaman` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_id` int NOT NULL,
  `user_id` int NOT NULL,
  `status` enum('Menunggu Persetujuan','Disetujui','Ditolak','Dipinjam','Menunggu Verifikasi','Selesai') DEFAULT 'Menunggu Persetujuan',
  `tanggal_pinjam` date NOT NULL,
  `tanggal_rencana_kembali` date DEFAULT NULL,
  `keperluan` text,
  `kondisi_awal` varchar(50) DEFAULT NULL,
  `foto_sebelum` varchar(255) DEFAULT NULL,
  `disetujui_oleh` int DEFAULT NULL,
  `disetujui_pada` timestamp NULL DEFAULT NULL,
  `tanggal_kembali_aktual` date DEFAULT NULL,
  `kondisi_saat_kembali` varchar(50) DEFAULT NULL,
  `foto_sesudah` varchar(255) DEFAULT NULL,
  `catatan_pengembalian` text,
  `diverifikasi_oleh` int DEFAULT NULL,
  `diverifikasi_pada` timestamp NULL DEFAULT NULL,
  `dibuat_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `barang_id` (`barang_id`),
  KEY `user_id` (`user_id`),
  KEY `disetujui_oleh` (`disetujui_oleh`),
  KEY `diverifikasi_oleh` (`diverifikasi_oleh`),
  CONSTRAINT `peminjaman_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`),
  CONSTRAINT `peminjaman_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `peminjaman_ibfk_3` FOREIGN KEY (`disetujui_oleh`) REFERENCES `users` (`id`),
  CONSTRAINT `peminjaman_ibfk_4` FOREIGN KEY (`diverifikasi_oleh`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.peminjaman: ~0 rows (approximately)

-- Dumping structure for table inventory_workshop.ruangan
CREATE TABLE IF NOT EXISTS `ruangan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_ruangan` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.ruangan: ~1 rows (approximately)
INSERT INTO `ruangan` (`id`, `nama_ruangan`, `created_at`) VALUES
	(1, 'Ruang Meeting', '2026-07-16 03:11:13');

-- Dumping structure for table inventory_workshop.users
CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `divisi` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.users: ~2 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `divisi`, `created_at`) VALUES
	(1, 'admin', 'admin@test.com', '$2b$10$00BYAXmQeKmN8QBHwZ1qT.3OvK00pAimbONvrRN3NMuLT1pLhTt7O', 'admin', NULL, '2026-07-15 10:00:43'),
	(2, 'adminnih', 'test2@test.com', '$2b$10$XxbyHTP.GpFSyO5A2d7aC.LSaV.tfFpf9rRYIsNTf13qSjiyipfOW', 'user', 'yuhu', '2026-07-16 07:24:38');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
