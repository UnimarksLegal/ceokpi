-- MySQL dump 10.13  Distrib 8.0.41, for Win64 (x86_64)
--
-- Host: localhost    Database: kra_kpi_db
-- ------------------------------------------------------
-- Server version	8.0.41

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `departments`
--

DROP TABLE IF EXISTS `departments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `departments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dept_name` varchar(50) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dept_name` (`dept_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `departments`
--

LOCK TABLES `departments` WRITE;
/*!40000 ALTER TABLE `departments` DISABLE KEYS */;
INSERT INTO `departments` VALUES (6,'Accounts & Finance'),(4,'Legal'),(2,'Marketing'),(3,'Operations'),(5,'People Development'),(1,'Sales');
/*!40000 ALTER TABLE `departments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `metrics`
--

DROP TABLE IF EXISTS `metrics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `dept_name` varchar(30) DEFAULT NULL,
  `metric_name` varchar(100) DEFAULT NULL,
  `metric_value` float DEFAULT '1',
  `is_inverse` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `dept_name` (`dept_name`),
  CONSTRAINT `metrics_ibfk_1` FOREIGN KEY (`dept_name`) REFERENCES `departments` (`dept_name`)
) ENGINE=InnoDB AUTO_INCREMENT=36 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `metrics`
--

LOCK TABLES `metrics` WRITE;
/*!40000 ALTER TABLE `metrics` DISABLE KEYS */;
INSERT INTO `metrics` VALUES (1,'Sales','New Client Acquisition',25,0),(2,'Sales','Revenue from New Matters',25,0),(3,'Sales','Deal Conversion Rate',25,0),(4,'Sales','Average Deal Size',25,0),(5,'Sales','Client Retention %',25,0),(6,'Marketing','Qualified Leads Generated',25,0),(7,'Marketing','Content & Thought Leadership',25,0),(8,'Marketing','SEO Ranking Performance',25,0),(9,'Marketing','Brand Visibility Index',25,0),(10,'Marketing','Cost per Lead (Efficiency)',25,0),(16,'Operations','Matter Turnaround Time',25,0),(17,'Operations','Process Compliance Rate',25,0),(18,'Operations','Technology Utilization',25,0),(19,'Operations','Error/Defect Rate (Low=Good)',75,1),(20,'Operations','Client Satisfaction in Delivery',25,0),(21,'Legal','Success Rate in Matters',25,0),(22,'Legal','Timeliness of Filings',25,0),(23,'Legal','Quality Review Score',25,0),(24,'Legal','High-value Case Wins',25,0),(25,'Legal','KM/Precedent Contributions',25,0),(26,'People Development','Attrition (Low=Good)',75,1),(27,'People Development','Training Hours / Associate',25,0),(28,'People Development','Performance Reviews on Time',25,0),(29,'People Development','Engagement Index',25,0),(30,'People Development','Hiring Effectiveness',25,0),(31,'Accounts & Finance','Revenue Growth Rate',25,0),(32,'Accounts & Finance','Collection Efficiency (DSO)',25,0),(33,'Accounts & Finance','Expense Ratio (Low=Good)',75,1),(34,'Accounts & Finance','Net Profit Margin',25,0),(35,'Accounts & Finance','Cash Reserve Months',25,0);
/*!40000 ALTER TABLE `metrics` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-01 13:09:13
