-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 15 Jul 2025 pada 09.18
-- Versi server: 10.4.28-MariaDB
-- Versi PHP: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `decision_tree`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `dataset`
--

CREATE TABLE `dataset` (
  `id` int(11) NOT NULL,
  `NPM` varchar(50) DEFAULT NULL,
  `IPK` varchar(50) DEFAULT NULL,
  `Pendapatan` varchar(50) DEFAULT NULL,
  `JumlahTanggungan` varchar(50) DEFAULT NULL,
  `PernahBeasiswa` varchar(10) DEFAULT NULL,
  `Keputusan` varchar(10) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `dataset`
--

INSERT INTO `dataset` (`id`, `NPM`, `IPK`, `Pendapatan`, `JumlahTanggungan`, `PernahBeasiswa`, `Keputusan`) VALUES
(1, NULL, '<3.00', '<3000000', '3', 'ya', 'ya'),
(2, NULL, '<3.00', '<3000000', '3', 'ya', 'ya'),
(3, NULL, '<3.00', '<3000000', '3', 'tidak', 'ya'),
(4, NULL, '3.0-3.4', '<3000000', '3', 'ya', 'tidak'),
(5, NULL, '>3.5', '3000000-5000000', '3', 'ya', 'tidak'),
(6, NULL, '>3.5', '>5000000', '>3', 'ya', 'tidak'),
(7, NULL, '>3.5', '>5000000', '>3', 'tidak', 'ya'),
(8, NULL, '3.0-3.4', '>5000000', '>3', 'tidak', 'tidak'),
(9, NULL, '<3.00', '3000000-5000000', '3', 'ya', 'ya'),
(10, NULL, '<3.00', '>5000000', '>3', 'ya', 'tidak'),
(11, NULL, '>3.5', '3000000-5000000', '>3', 'ya', 'tidak'),
(12, NULL, '<3.0', '3000000-5000000', '>3', 'tidak', 'tidak'),
(13, NULL, '3.0-3.4', '3000000-5000000', '3', 'tidak', 'tidak'),
(14, NULL, '3.0-3.4', '<3000000', '>3', 'ya', 'ya'),
(15, NULL, '>3.5', '3000000-5000000', '>3', 'tidak', 'ya');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `dataset`
--
ALTER TABLE `dataset`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `dataset`
--
ALTER TABLE `dataset`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
