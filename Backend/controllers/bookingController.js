import fs from 'fs';
import path from 'path';

// GET /api/bookings/export
export const exportBookingsLog = async (req, res) => {
  try {
    // 1. Mock Data (Dummy Bookings) - 
    const mockBookings = [
      { id: 'B101', client: 'Ali Khan', service: 'MERN Stack Development', amount: 150, date: '2026-03-10' },
      { id: 'B102', client: 'Zainab Ahmed', service: 'Graphic Design UI/UX', amount: 80, date: '2026-03-11' },
      { id: 'B103', client: 'Hamza Yusuf', service: 'SEO Optimization', amount: 120, date: '2026-03-12' },
      { id: 'B104', client: 'Ayesha Raza', service: 'Content Writing', amount: 50, date: '2026-03-13' },
    ];

    // 2. Platform-Independent Path Setup 
    const exportsDir = path.join(process.cwd(), 'exports');
    const filePath = path.join(exportsDir, 'bookings-log.txt');

    // 3. Folder Directory Check (Edge Case Control)
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir);
    }

    // 4. Initialize Writable Stream (The Core Streams Pattern)
    const writeStream = fs.createWriteStream(filePath, { flags: 'w', encoding: 'utf-8' });

    // Header line write karein log file ke top par
    writeStream.write("=========================================\n");
    writeStream.write(`CONNECTHUB BOOKINGS LOG REPORT - GENERATED AT: ${new Date().toISOString()}\n`);
    writeStream.write("=========================================\n\n");

    // 5. Streaming Data Chunks Loop
    mockBookings.forEach((booking, index) => {
      const logLine = `[LOG #${index + 1}] ID: ${booking.id} | Client: ${booking.client} | Service: ${booking.service} | Amount: $${booking.amount} | Date: ${booking.date}\n`;
      
      // Her line ko chunk ki surat mein write stream me bhej rahe hain
      writeStream.write(logLine);
    });

    writeStream.write("\n=========================================\n");
    writeStream.write("END OF LOG REPORT\n");
    writeStream.write("=========================================\n");

    // 6. Stream Closing & Callback Event
    writeStream.end();

    // Event checking hook 
    writeStream.on('finish', () => {
      console.log(`[Streams Success] Logs safely written to: ${filePath}`);
    });

    // 7. Success Response sending back to front-end
    res.status(200).json({
      success: true,
      message: 'Bookings log report exported successfully using Writable Streams!',
      fileName: 'bookings-log.txt',
      savedLocation: filePath
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error during logging process', error: error.message });
  }
};
