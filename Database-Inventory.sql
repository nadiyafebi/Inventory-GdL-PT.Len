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
  `penanggung_jawab` varchar(100) DEFAULT NULL,
  `serial_number` varchar(100) DEFAULT NULL,
  `nomor_inventaris_ga` varchar(100) DEFAULT NULL,
  `program_project` varchar(150) DEFAULT NULL,
  `harga` decimal(15,2) DEFAULT NULL,
  `status` enum('-','Dibeli','Dikirim','Dipasang','Didaftarkan','Disimpan','Dipakai','Dipinjam','Dikembalikan','Diperbaiki','Rusak','Hilang','Dibuang','Dijual') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT 'Dibeli',
  `kondisi` enum('Rusak Ringan','Rusak Berat','Baru','Bekas','Siap Pakai','Full','Kosong','Belum Siap','Baik') CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL,
  `lokasi` varchar(150) DEFAULT NULL,
  `catatan` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `serial_number` (`serial_number`)
) ENGINE=InnoDB AUTO_INCREMENT=158 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.barang: ~154 rows (approximately)
INSERT INTO `barang` (`id`, `kode_barang`, `nama_barang`, `quantity`, `merk`, `tipe`, `part_number`, `penanggung_jawab`, `serial_number`, `nomor_inventaris_ga`, `program_project`, `harga`, `status`, `kondisi`, `lokasi`, `catatan`, `created_at`, `updated_at`) VALUES
	(1, 'ACR-E00001', 'Inverter 12 to 220', 1, 'Krisbow', 'MT-PC200Pro', 'MT-PC200Pro', 'Andre Tigana', 'ACR-E00001', '-', 'Workshop Radar (Astacita)', NULL, 'Disimpan', 'Siap Pakai', 'Gedung L', NULL, '2026-07-24 08:59:56', '2026-08-07 02:37:49'),
	(2, 'PMR-M0000', 'tool kit', 1, 'JONNESWAY', 'RAK', '440786', 'Andre Tigana', NULL, NULL, 'Workshop Radar (Astacita)', NULL, 'Disimpan', 'Siap Pakai', 'Gedung L', '', '2026-07-24 09:01:57', '2026-08-07 02:47:24'),
	(6, 'PMR-M0000', 'TOOL KIT', 1, 'JONNESWAY', 'RAK', '448160', 'Andre Tigana', NULL, NULL, 'Workshop Radar (Astacita)', NULL, 'Disimpan', 'Siap Pakai', 'Gedung L', NULL, '2026-07-24 09:19:20', '2026-08-07 02:29:26'),
	(7, 'PMR-E0001', 'RF Radiation Monitor', 1, NULL, NULL, 'RADMAN2XT2281', NULL, '25060003', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(8, 'PMR-E00002', 'Signal Generator', 1, 'RONDE & SCHWARZ ', 'SMB100B', 'SMB100B', 'Andre Tigana', '25091059', '1422.1000K02-107036', 'PMN Radar 2023', NULL, '-', 'Full', 'Workshop 1 Gd L', NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(9, 'PMR-E00003', 'Power Meter Ave', 1, NULL, NULL, 'N1913B', NULL, '25070508', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(10, 'PMR-E0004', 'Atteunator', 1, NULL, NULL, 'WAS-18', NULL, '25010463', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(11, 'PMR-E00005', 'Oscilloscope', 1, NULL, NULL, 'C031765', NULL, '25030450', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(12, 'PMR-E0007', 'Spectrum Analyzer', 1, 'Rohde & Schwarz', 'FSH8', 'FSH8', 'Andre Tigana', '25060547', '1309.6000K08-116933-CV', 'PMN Radar 2023', NULL, '-', 'Siap Pakai', 'Gedung L', NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(13, NULL, 'Draht', 1, NULL, NULL, '59-0130', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(14, NULL, 'Abisolierer', 1, NULL, NULL, '440480', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(15, NULL, 'Drehmomentsclussel', 1, NULL, NULL, '88-2007', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(16, NULL, 'ESD Band Anti Statik Klet', 1, NULL, NULL, '442283', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(17, NULL, 'Radial R282.3', 1, NULL, NULL, '440209', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(18, NULL, 'Average Power Sensor', 1, 'Keysight', 'N8481A', 'N8481A', NULL, '23010416', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(19, 'PMR-M00001', 'Set of Tools', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(20, 'PMR-M00004', 'Lamp', 1, NULL, NULL, '440507', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(21, 'PMR-M00005', 'Tool', 1, NULL, NULL, '440555', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(22, 'PMR-M00006', 'Screwdriver bit', 1, NULL, NULL, '440780', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(23, 'PMR-M00007', 'Screwdriver bit', 1, NULL, NULL, '440537', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(24, 'PMR-M00008', 'Screwdriver bit', 1, NULL, NULL, '440538', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(25, 'PMR-M00009', 'Torque Wrench', 1, NULL, NULL, '440539', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(26, 'PMR-M00010', 'Torque Wrench', 1, NULL, NULL, '440493', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(27, NULL, 'Torque Wrench', 1, NULL, NULL, '440479', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(28, NULL, 'Torque Wrench', 1, NULL, NULL, '88-22007', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(29, 'PMR-M00011', 'Adapter Piece', 1, NULL, NULL, '440779', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(30, 'PMR-M00012', 'Screwdriver', 1, NULL, NULL, '440778', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(31, 'PMR-M00013', 'Blade', 1, NULL, NULL, '440564', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(32, 'PMR-M00014', 'Knife', 1, NULL, NULL, '440505', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(33, 'PMR-M00015', 'Cable Reel', 1, NULL, NULL, '440511', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(34, 'PMR-M00016', 'Mirror', 1, NULL, NULL, '440776', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(35, 'PMR-M00017', 'Measuring Instruments', 1, NULL, NULL, '440550', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(36, 'PMR-M00018', 'Soldering Iron', 1, NULL, NULL, '447654', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(37, 'PMR-M00019', 'Lamp', 1, NULL, NULL, '447405', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(38, 'PMR-M00020', 'Caliper', 1, NULL, NULL, '440777', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(39, 'PMR-M00021', 'Tape Measure', 1, NULL, NULL, '440509', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(40, 'PMR-M00022', 'Tool', 1, NULL, NULL, '440481', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(41, 'PMR-M00023', 'Wrench', 1, NULL, NULL, '102-0060', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(42, 'PMR-M00024', 'Measuring Cup', 1, NULL, NULL, '440559', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(43, 'PMR-M00025', 'Wrench', 1, NULL, NULL, '440774', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(44, 'PMR-M00026', 'Screwdriver', 1, NULL, NULL, '440560', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(45, 'PMR-M00027', 'Screwdriver', 1, NULL, NULL, '440563', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(46, 'PMR-M00028', 'Screwdriver', 1, NULL, NULL, '440557', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(47, 'PMR-M00029', 'Screwdriver', 1, NULL, NULL, '440558', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(48, 'PMR-M00030', 'Screwdriver', 1, NULL, NULL, '440561', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(49, 'PMR-M00031', 'Pillers', 1, NULL, NULL, '440562', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(50, 'PMR-M00032', 'Pillers', 1, NULL, NULL, '440520', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(51, 'PMR-M00033', 'Side Cutter', 1, NULL, NULL, '440572', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(52, 'PMR-M00034', 'Container', 1, NULL, NULL, '440569', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(53, 'PMR-M00035', 'Side Cutter', 1, NULL, NULL, '440549', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(54, 'PMR-M00036', 'Tweezers', 1, NULL, NULL, '448086', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(55, 'PMR-M00037', 'Pillers', 1, NULL, NULL, '440547', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(56, 'PMR-M00038', 'Pillers', 1, NULL, NULL, '440513', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(57, 'PMR-M00039', 'Pillers', 1, NULL, NULL, '440568', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(58, 'PMR-M00040', 'Pillers', 1, NULL, NULL, '440570', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(59, 'PMR-M00041', 'Hammer', 1, NULL, NULL, '440571', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(60, 'PMR-M00042', 'Hammer', 1, NULL, NULL, '440501', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(61, 'PMR-M00043', 'Scissors', 1, NULL, NULL, '440502', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(62, 'PMR-M00044', 'Knife', 1, NULL, NULL, '440519', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(63, 'PMR-M00045', 'Multimeter', 1, NULL, NULL, 'M241A', NULL, '25040005', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(64, 'PMR-M00046', 'Scredriver', 1, NULL, NULL, '4407655', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(65, 'PMR-M00047', 'Scredriver', 1, NULL, NULL, '440521', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(66, 'PMR-M00048', 'Tool', 1, NULL, NULL, '440522', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(67, 'PMR-M00049', '1/4" HEX SOCKET *', 1, NULL, NULL, '102-0067', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(68, 'PMR-M00050', 'Tool', 1, NULL, NULL, '102-0066', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(69, 'PMR-M00051', 'Tool Kit', 1, NULL, NULL, '440565', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(70, 'PMR-M00052', 'Wire', 1, NULL, NULL, '448161', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(71, 'PMR-M00059', 'Multimeter', 1, 'METRAHIT/38-0013', NULL, '38-0013', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(72, 'PMR-M00061', 'Detector', 1, NULL, NULL, '8474B', NULL, '24110021', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(73, NULL, 'Rak Hitam', 2, NULL, NULL, NULL, NULL, 'N/A 40x100x200', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(74, NULL, 'Printer A3 InkJet L145', 1, NULL, 'L145', NULL, NULL, 'A14C02022918-001', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(75, NULL, 'Rak Abu', 1, NULL, NULL, NULL, NULL, 'RL', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(76, NULL, 'Laptop', 1, NULL, NULL, NULL, NULL, 'A06051A12-123', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(77, NULL, 'Software Visual Studio', 1, NULL, NULL, NULL, NULL, 'A14', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(78, NULL, 'Kursi Putar', 14, NULL, NULL, NULL, NULL, 'C32A07037B18-047', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(79, NULL, 'Tempat Sampah Hitam', 3, NULL, 'Tatay Cubo 17 L', NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(80, NULL, 'Radar', 1, 'Koden', NULL, NULL, NULL, 'A4381C', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(81, NULL, 'Meja Kubikel L 140cm', 5, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(82, NULL, 'Meja Rapat Putih', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(83, NULL, 'Tv Digital LED', 1, 'Samsung', '32 Inch', NULL, NULL, 'A12C0606DB13-014', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(84, NULL, 'Exhaust Fan KDK', 4, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(85, NULL, 'Meja Coklat', 2, NULL, 'Meja Kerja HPL', NULL, NULL, 'A32A2204A112-258', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(86, NULL, 'AC', 1, 'Panasonic', 'AC 1/2 PK (Eksisting)', NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(87, NULL, 'Magnifying Lamp', 6, NULL, 'SL114N', NULL, NULL, NULL, 'Model SL 114N', NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(88, NULL, 'Stativ Tripod', 2, 'Rohde & Schwardz', NULL, NULL, NULL, NULL, '22C5902', NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(89, NULL, 'Broadband Dipole', 1, 'Rohde & Schwardz', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(90, NULL, 'Strain Meter Indikator', 1, 'Kyowa', 'SM-60D', NULL, NULL, NULL, '23B17401/11/151', NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(91, NULL, 'Microwave Frekuensi Counter', 1, 'HP', 'Hewlett 5350B', NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(92, NULL, 'Microwave Counter/Power Meter', 1, 'HP', 'Hewlett 5347A', NULL, NULL, NULL, 'A23A15032C55-003', NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(93, NULL, 'Power Supply PSD 3000 Hitam', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(94, NULL, 'Power Supply PSD 3000 Silver', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(95, NULL, 'Kabel Koaksial 20 M', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(96, NULL, 'Kabel Koaksial 30 M', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(97, NULL, 'Monitor CMS Lama', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(98, NULL, 'Tool Box Mission Console System', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(99, NULL, 'Tool Box Polos', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(100, NULL, 'Laptop Dell', 1, 'Dell', 'P69G001', '93KXK A04', NULL, 'C4NBZN2', 'A14G010A0A18-001', NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(101, NULL, 'Microwave Link (MWL) S + Stand', 1, NULL, 'MIL', 'ES0140A00505_20', NULL, '853127', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(102, NULL, 'Microwave Link (MWL) C + Stand', 1, NULL, 'MIL', 'ES0140A00504_21', NULL, '853129', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(103, NULL, 'Universal Military Module + Stand', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(104, NULL, 'Portable Server', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(105, NULL, 'Humidity Meter', 1, 'FanJu', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(106, NULL, 'Log Periodic Antenna', 1, 'Teseq', 'Teseq GmbH\n Landsberger Str. 255\n 30MHz - 2GHz', 'CBL 6141B', NULL, 'D-12623 Berlin', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(107, NULL, 'Double Ridged Broadband Horn Antenna', 1, 'RE Spin', 'DRH18-EX', NULL, NULL, '190703A18EX', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(108, NULL, 'Drawer Trolley Tool Kit', 1, 'Jonnesway', NULL, 'BOT-021-TKW', NULL, 'BOT-021-TKW-001', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(109, NULL, 'Mesurement Device', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(110, NULL, 'Cable Set', 1, NULL, NULL, NULL, NULL, '25070170', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(111, NULL, 'Transition SMA-SMA-50 Ohm - St/St', 1, NULL, NULL, '35-0483', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(112, NULL, 'Adapter - 50 OHM BNC-STECKER/SMA-BUCHSE', 1, NULL, NULL, '35-1011', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(113, NULL, 'Transition N-SMA - 50 Ohm - Bu/St', 1, NULL, NULL, '35-1303', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(114, NULL, 'Transition N-SMA - 50 Ohm - St/Bu', 1, NULL, NULL, '35-0596', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(115, NULL, 'Adapter - 50 OHM SMA-BU/SMA-BU', 1, NULL, NULL, '35-1604', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(116, NULL, 'Adapter - 50 OHM N-BU/N-BU', 1, NULL, NULL, '35-0560', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(117, NULL, 'Transition N-SMA - 50 Ohm - Bu/Bu', 1, NULL, NULL, '35-1534', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(118, NULL, 'Transition SMB-BNC - 50 Ohm - Bu/Bu', 1, NULL, NULL, '35-1620', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(119, NULL, 'Koaxialkabel - 50 OHM - St/Bu', 1, NULL, NULL, '60-2262', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(120, NULL, 'Koaxialkabel Semiflex - 1,00m (SMA 0°)-SMA(O°)', 1, NULL, NULL, '60-1980', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(121, NULL, 'Koaxialkabel Semiflex - 0,30m (SMA 0°)-SMA(O°)', 1, NULL, NULL, '60-1262', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(122, NULL, 'Transition SMA-SMA - 50 Ohm - St/Bu', 1, NULL, NULL, '35-0484', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(123, NULL, 'Koaxialkabel Semiflex - 0,50m (SMA 0°)-SMA(O°)', 1, NULL, NULL, '60-1264', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(124, NULL, 'Koaxialkabel - 50 OHM - 1m - BNC', 1, NULL, NULL, '60-1740', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(125, NULL, 'ADAPTER, TEST - 3HE D32', 1, NULL, NULL, '63-0219', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(126, NULL, 'ETUI - FUR TESTADAPTER 3HE', 1, NULL, NULL, '63-0414', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(127, NULL, 'Extender Card - EXTENDER CARD 3HE COMPLETE', 1, NULL, NULL, '76-2837', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(128, NULL, 'Attenuator - MOD. 2 - 30dB - N', 1, NULL, NULL, '76-2053', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(129, NULL, 'TESTKABEL SMB - BNC -2m 500OHM', 1, NULL, NULL, '60-1244', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(130, NULL, 'N-ADAPTER L - 500HM/(UG27C/U)/S-B*', 1, NULL, NULL, '35-0569', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(131, NULL, 'SMA-Connector - 50 Ohm - WInkel - Einbau', 1, NULL, NULL, '35-0485', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(132, NULL, 'SMA-Buchse - 50 Ohm Bu-St-Bu - T Verbinder', 1, NULL, NULL, '35-0872', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(133, NULL, 'BNC-Sonderverbinder - 50 Ohm-T Verb-Bu/Bu/St', 1, NULL, NULL, '35-0743', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(134, NULL, 'SMA-Abschluss - 50OHM - pos.plus *', 1, NULL, NULL, '35-0451', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(135, NULL, 'BNC-Sonderverbinder - 50 Ohm-Abschlussstecker', 1, NULL, NULL, '35-0744', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(136, NULL, 'Transition N-BNC - 50 Ohm - St/Bu', 1, NULL, NULL, '35-0746', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(137, NULL, 'Transition N-SMA - 50 Ohm - St/Bu', 1, NULL, NULL, '35-1300', NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(138, NULL, 'Signal Generator', 1, NULL, NULL, NULL, NULL, 'ID.K122.1000K02-107036-MK/25091059', NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(139, NULL, 'Semiflex Cable', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(140, NULL, 'Draht', 1, NULL, NULL, '59-0131', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(141, NULL, 'Drehmomentsclussel', 1, NULL, NULL, '88-2008', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(142, NULL, 'ESD Band Anti Statik Klet', 1, NULL, NULL, '438135', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(143, NULL, 'Radial R282.4', 1, NULL, NULL, '436061', NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(144, 'PMR-M00062', 'Set of Tools', 1, NULL, NULL, NULL, NULL, NULL, NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(145, 'PMR-M00106', 'Multimeter', 1, NULL, NULL, '440510', NULL, '25040006', NULL, 'PMN Radar 2023', NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(146, NULL, 'papan tulis', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(147, NULL, 'Toolkits Test Bench Radar Pasif', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(148, NULL, 'Mobil', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(149, NULL, 'Drawer Trolley Tool Kit', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(150, NULL, 'Lemari', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(151, NULL, 'Microwave Frequency Counter', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(152, NULL, 'Dual Power Supply', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(153, NULL, 'Printer A3 InkJet L145 ', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(154, NULL, 'Software Visual Studio', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(155, NULL, 'Power Supply Silver', 1, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '-', NULL, NULL, NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(156, '16.1"', 'MONITOR 1', 1, 'Arzopa', 'Z1C ', '40468', 'Andre Tigana', '81513723', ' ', 'Astacita Radar dan Electronic Warfare', NULL, '-', 'Siap Pakai', 'Workshop 1 Gd L', NULL, '2026-08-06 04:47:07', '2026-08-06 04:47:07'),
	(157, 'PMR-E0001', 'TV LED', 1, 'LG', '55UQ7500PSF', '4CMGL09H', 'Andre Tigana', '403INLVEY568', NULL, 'PMN Radar 2023', NULL, '-', 'Siap Pakai', 'Workshop 1 Gd L', NULL, '2026-08-06 04:47:07', '2026-08-07 08:10:04');

-- Dumping structure for table inventory_workshop.barang_dokumentasi
CREATE TABLE IF NOT EXISTS `barang_dokumentasi` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_id` int NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `keterangan` varchar(255) DEFAULT NULL,
  `diupload_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `barang_id` (`barang_id`),
  CONSTRAINT `barang_dokumentasi_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.barang_dokumentasi: ~0 rows (approximately)

-- Dumping structure for table inventory_workshop.barang_foto
CREATE TABLE IF NOT EXISTS `barang_foto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_id` int NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `diupload_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `barang_id` (`barang_id`),
  CONSTRAINT `barang_foto_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.barang_foto: ~3 rows (approximately)
INSERT INTO `barang_foto` (`id`, `barang_id`, `file_path`, `diupload_pada`) VALUES
	(2, 1, '/uploads/barang/1784883596401-858345831.jpg', '2026-07-24 08:59:56'),
	(3, 2, '/uploads/barang/1784883717049-391591423.jpg', '2026-07-24 09:01:57'),
	(4, 6, '/uploads/barang/1784884760426-765057449.jpg', '2026-07-24 09:19:20');

-- Dumping structure for table inventory_workshop.barang_manual_book
CREATE TABLE IF NOT EXISTS `barang_manual_book` (
  `id` int NOT NULL AUTO_INCREMENT,
  `barang_id` int NOT NULL,
  `file_path` varchar(255) NOT NULL,
  `tipe_file` varchar(10) DEFAULT NULL,
  `diupload_pada` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `barang_id` (`barang_id`),
  CONSTRAINT `barang_manual_book_ibfk_1` FOREIGN KEY (`barang_id`) REFERENCES `barang` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.barang_manual_book: ~1 rows (approximately)
INSERT INTO `barang_manual_book` (`id`, `barang_id`, `file_path`, `tipe_file`, `diupload_pada`) VALUES
	(2, 1, '/uploads/barang/manual-book/1784885195550-700542666.pdf', 'pdf', '2026-07-24 09:26:35');

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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.booking_ruangan: ~1 rows (approximately)
INSERT INTO `booking_ruangan` (`id`, `ruangan_id`, `user_id`, `tanggal`, `jam_mulai`, `jam_selesai`, `keperluan`, `status`, `approved_by`, `diajukan_pada`) VALUES
	(10, 4, 5, '2026-08-07', '08:00:00', '12:00:00', 'ghfhf', 'Disetujui', NULL, '2026-08-07 02:52:06');

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
) ENGINE=InnoDB AUTO_INCREMENT=179 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.peminjaman: ~0 rows (approximately)

-- Dumping structure for table inventory_workshop.ruangan
CREATE TABLE IF NOT EXISTS `ruangan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nama_ruangan` varchar(150) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.ruangan: ~4 rows (approximately)
INSERT INTO `ruangan` (`id`, `nama_ruangan`, `created_at`) VALUES
	(1, 'Workshop 1 Gd L', '2026-07-27 01:45:39'),
	(2, 'Workshop 2 Gd L', '2026-07-27 01:45:39'),
	(3, 'Ruang Rapat Gd L', '2026-07-27 01:45:39'),
	(4, 'Gedung L', '2026-07-27 01:45:39');

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Dumping data for table inventory_workshop.users: ~3 rows (approximately)
INSERT INTO `users` (`id`, `nama`, `email`, `password`, `role`, `divisi`, `created_at`) VALUES
	(1, 'admin', 'admin@test.com', '$2b$10$00BYAXmQeKmN8QBHwZ1qT.3OvK00pAimbONvrRN3NMuLT1pLhTt7O', 'admin', NULL, '2026-07-15 10:00:43'),
	(4, 'manda', 'user123@gmail.com', '$2b$10$26dxRnxTTDUT2hfRK2mpZuG9kzfeMCwlrsLqorTl23gPB/8gZNaUe', 'user', 'PDC', '2026-07-22 09:20:55'),
	(5, 'Nadiya', 'nadiya1@gmail.com', '$2b$10$5ft3GFgvADwhH5fcFnk5LOEa0tRr7/ph.jGNQENpsUR3FoElsIEGC', 'user', NULL, '2026-08-06 02:06:11');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
