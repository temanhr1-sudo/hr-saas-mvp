// src/utils/analytics.js

// --- 1. HELPER PARSING ---
export const parseTime = (timeStr) => {
  if (!timeStr || timeStr === '0' || timeStr === '' || timeStr === '-') return 0;
  if (typeof timeStr === 'number') return Math.round(timeStr * 24 * 60);
  try {
    const parts = String(timeStr).trim().split(':');
    return (parseInt(parts[0]) || 0) * 60 + (parseInt(parts[1]) || 0);
  } catch (e) { return 0; }
};

export const timeToHours = (minutes) => (minutes / 60).toFixed(2);

export const parseDateLocal = (dateStr) => {
  if (!dateStr) return null;
  try {
    if (typeof dateStr === 'number') return new Date(Math.round((dateStr - 25569) * 86400 * 1000));
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split('/');
      return new Date(parts[2], parts[1] - 1, parts[0]);
    }
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day);
    }
    return new Date(dateStr);
  } catch (e) { return null; }
};

// --- 2. LOGIC DEFINITIONS ---
const PRESENT_EXCEPTIONS = ['dinas', 'trip', 'tugas', 'wfh', 'meeting'];
// PENTING: Sakit/Cuti ada di sini agar TIDAK dihitung sebagai denominator
const EXCLUDED_EXCEPTIONS = ['sakit', 'sick', 'cuti', 'leave', 'izin', 'off', 'libur'];
const PENALIZED_EXCEPTIONS = ['alpha', 'mangkir', 'unpaid', 'absen'];

const checkException = (row, keywords) => {
  const exc = row.Pengecualian ? String(row.Pengecualian).toLowerCase() : '';
  return keywords.some(k => exc.includes(k));
};

// --- 3. IS WORKING DAY? ---
export const isWorkingDay = (row) => {
  if (String(row['Akhir Pekan']).toLowerCase() === 'true' || String(row['Akhir Pekan']) === '1') return false;
  if (String(row['Hari Libur']).toLowerCase() === 'true' || String(row['Hari Libur']) === '1') return false;
  
  if (row.Tanggal) {
    const date = parseDateLocal(row.Tanggal);
    if (date && (date.getDay() === 0 || date.getDay() === 6)) return false; 
  }

  // JIKA SAKIT/CUTI -> RETURN FALSE (Agar tidak dihitung sebagai total hari kerja)
  if (checkException(row, EXCLUDED_EXCEPTIONS)) return false;

  const hasSchedule = parseTime(row['Jam Masuk']) > 0;
  const hasActivity = parseTime(row['Scan Masuk']) > 0 || checkException(row, PRESENT_EXCEPTIONS);
  if (!hasSchedule && !hasActivity) return false;
   
  return true;
};

// --- 4. VALIDASI KEHADIRAN ---
export const validateAttendance = (row) => {
  const tIn = parseTime(row['Scan Masuk']);
  const tOut = parseTime(row['Scan Pulang']);
  const isDinas = checkException(row, PRESENT_EXCEPTIONS);
  const isAlpha = checkException(row, PENALIZED_EXCEPTIONS);

  const isPresent = !isAlpha && (tIn > 0 || tOut > 0 || isDinas);
  const isPartial = !isDinas && !isAlpha && ((tIn > 0 && tOut === 0) || (tIn === 0 && tOut > 0));

  return { isPresent, isPartial, isDinas };
};

// --- 5. MAIN CALCULATION ---
export const calculateAnalytics = (filteredData) => {
  if (!filteredData || filteredData.length === 0) return null;
   
  const workingDays = filteredData.filter(row => isWorkingDay(row)); // Filter Hari Kerja Efektif
  const totalEmployees = new Set(filteredData.map(row => row['Emp No.'])).size;
  const totalRecords = workingDays.length; // Denominator (Hanya hari wajib masuk)
   
  // Count Metrics
  const attendanceCount = workingDays.filter(row => validateAttendance(row).isPresent).length;
  
  const lateRecordsArray = workingDays.filter(row => {
    if (checkException(row, PRESENT_EXCEPTIONS)) return false;
    const scan = parseTime(row['Scan Masuk']);
    const sched = parseTime(row['Jam Masuk']);
    return scan > (sched + 1) && sched > 0;
  });
  
  const totalLateMinutes = lateRecordsArray.reduce((sum, row) => sum + (parseTime(row['Scan Masuk']) - parseTime(row['Jam Masuk'])), 0);

  const overtimeRecordsArray = filteredData.filter(row => {
    if (parseTime(row.Lembur) > 0) return true;
    const scan = parseTime(row['Scan Pulang']);
    const sched = parseTime(row['Jam Pulang']);
    return scan > (sched + 30) && sched > 0;
  });

  const totalOvertimeMinutes = filteredData.reduce((sum, row) => {
    const manual = parseTime(row.Lembur);
    if (manual > 0) return sum + manual;
    const scan = parseTime(row['Scan Pulang']);
    const sched = parseTime(row['Jam Pulang']);
    return sum + (scan > sched ? scan - sched : 0);
  }, 0);

  // Leave Types
  const countExc = (k) => filteredData.filter(row => checkException(row, [k])).length;
  const leaveTypes = {
    sick: countExc('sick') + countExc('sakit'),
    leave: countExc('leave') + countExc('cuti'),
    businessTrip: countExc('trip') + countExc('dinas'),
    unpaidLeave: countExc('unpaid') + countExc('alpha'),
    wfh: countExc('wfh')
  };

  // KPI Percentages
  const safeDiv = (a, b) => b > 0 ? ((a / b) * 100).toFixed(2) : '0.00';
  
  const attendanceRate = safeDiv(attendanceCount, totalRecords);
  const lateRate = safeDiv(lateRecordsArray.length, attendanceCount); // Telat dibanding Hadir
  const overtimeRate = safeDiv(overtimeRecordsArray.length, totalRecords);
  const onTimeCount = Math.max(0, attendanceCount - lateRecordsArray.length);
  const punctualityRate = safeDiv(onTimeCount, attendanceCount);
  const complianceScore = ((parseFloat(attendanceRate) * 0.6) + (parseFloat(punctualityRate) * 0.4)).toFixed(2);

  // Radar Data
  const radarData = [
    { metric: 'Kehadiran', value: parseFloat(attendanceRate), fullMark: 100 },
    { metric: 'Ketepatan', value: parseFloat(punctualityRate), fullMark: 100 },
    { metric: 'Compliance', value: parseFloat(complianceScore), fullMark: 100 },
    { metric: 'Disiplin Waktu', value: 100 - parseFloat(lateRate), fullMark: 100 },
    { metric: 'Efektivitas', value: parseFloat(attendanceRate) > 95 ? 100 : parseFloat(attendanceRate), fullMark: 100 } 
  ];

  return {
    totalEmployees, totalRecords, attendanceCount, 
    lateRecords: lateRecordsArray.length, totalLateHours: timeToHours(totalLateMinutes),
    overtimeRecords: overtimeRecordsArray.length, totalOvertimeHours: timeToHours(totalOvertimeMinutes),
    attendanceRate, punctualityRate, lateRate, overtimeRate, complianceScore,
    leaveTypes, radarData
  };
};

// Exports lain tetap sama...
export const calculateDepartmentStats = (filteredData) => { /* logic sama */ };
export const calculateEmployeeStats = (filteredData) => { /* logic sama */ };