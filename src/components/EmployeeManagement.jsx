import React, { useState } from 'react';
import { Users, Plus, Search, Edit2, Trash2, Eye, Download, Upload, FileSpreadsheet, X, Save } from 'lucide-react';
import * as XLSX from 'xlsx';
import { supabase } from '../supabaseClient'; // Import koneksi database

const EmployeeManagement = ({ tier, employees, setEmployees, setCurrentPage }) => {
  // State untuk Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartemen, setFilterDepartemen] = useState('all');
  
  // State untuk Form (Tambah/Edit)
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // Mode Edit atau Tambah
  const [isSaving, setIsSaving] = useState(false); // Loading saat simpan
  const [formData, setFormData] = useState({ 
    id: null, 
    nama: '', 
    departemen: '', 
    posisi: '', 
    email: '', 
    status: 'Aktif' 
  });

  const departments = ['IT', 'Marketing', 'Finance', 'HR', 'Operations', 'Sales'];

  // --- 1. HANDLE INPUT FORM ---
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const resetForm = () => {
    setFormData({ id: null, nama: '', departemen: '', posisi: '', email: '', status: 'Aktif' });
    setShowForm(false);
    setIsEditing(false);
  };

  const openEditForm = (employee) => {
    setFormData(employee);
    setIsEditing(true);
    setShowForm(true);
  };

  // --- 2. FUNGSI SIMPAN (CREATE & UPDATE) ---
  const handleSave = async () => {
    // Validasi Form
    if (!formData.nama || !formData.departemen || !formData.posisi) {
      alert('Mohon lengkapi Nama, Departemen, dan Posisi!');
      return;
    }

    setIsSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (isEditing) {
        // --- LOGIKA UPDATE ---
        const { error } = await supabase
          .from('employees')
          .update({
            nama: formData.nama,
            departemen: formData.departemen,
            posisi: formData.posisi,
            email: formData.email,
            status: formData.status
          })
          .eq('id', formData.id);

        if (error) throw error;

        // Update State Lokal (biar gak perlu refresh)
        setEmployees(employees.map(emp => (emp.id === formData.id ? { ...emp, ...formData } : emp)));
        alert("✅ Data berhasil diperbarui!");

      } else {
        // --- LOGIKA CREATE (TAMBAH BARU) ---
        
        // Cek Limit Tier
        const maxFree = 3;
        if (tier === 'free' && employees.length >= maxFree) {
          alert("✋ Limit Tercapai!\n\nUser Free hanya boleh input 3 karyawan.\nSilakan Upgrade ke PRO.");
          setIsSaving(false);
          return;
        }

        const { data, error } = await supabase
          .from('employees')
          .insert([{ 
            nama: formData.nama, 
            departemen: formData.departemen, 
            posisi: formData.posisi, 
            email: formData.email, 
            status: formData.status,
            user_id: user.id 
          }])
          .select();

        if (error) throw error;

        // Update State Lokal
        setEmployees([data[0], ...employees]);
        alert("✅ Karyawan berhasil ditambahkan!");
      }

      resetForm();

    } catch (error) {
      alert('Gagal menyimpan: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. FUNGSI HAPUS (DELETE) ---
  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data ini secara permanen?')) {
      try {
        const { error } = await supabase.from('employees').delete().eq('id', id);
        if (error) throw error;

        setEmployees(employees.filter(emp => emp.id !== id));
      } catch (error) {
        alert('Gagal menghapus: ' + error.message);
      }
    }
  };

  // --- 4. EXCEL EXPORT & TEMPLATE ---
  const handleDownloadTemplate = () => {
    const templateData = [{ "Nama Lengkap": "Budi Santoso", "Email": "budi@mail.com", "Departemen": "IT", "Posisi": "Staff", "Status": "Aktif" }];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "Template_Import_Karyawan.xlsx");
  };

  const handleExportExcel = () => {
    const dataToExport = employees.map(emp => ({
      "Nama": emp.nama, "Email": emp.email, "Departemen": emp.departemen, "Posisi": emp.posisi, "Status": emp.status
    }));
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Karyawan");
    XLSX.writeFile(wb, `Data_Karyawan_HRPro_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // --- 5. EXCEL IMPORT (DENGAN SUPABASE) ---
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Cek Limit Sebelum Baca File (Biar gak berat)
    const maxFree = 3;
    if (tier === 'free' && employees.length >= maxFree) {
      alert("✋ Akun Free sudah mencapai limit! Tidak bisa import data.");
      e.target.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

      // Mapping data Excel ke Format DB Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const newEmployees = data.map(row => ({
        nama: row['Nama Lengkap'] || row['Nama'] || 'No Name',
        email: row['Email'] || '-',
        departemen: row['Departemen'] || 'Umum',
        posisi: row['Posisi'] || 'Staff',
        status: row['Status'] || 'Aktif',
        user_id: user.id
      }));

      // Cek apakah import ini akan melebihi kuota
      if (tier === 'free' && (employees.length + newEmployees.length) > maxFree) {
        alert(`✋ Gagal Import!\n\nFile berisi ${newEmployees.length} data, tapi sisa kuota Anda tidak cukup.\nSilakan Upgrade ke PRO.`);
        return;
      }

      // Bulk Insert ke Supabase
      try {
        const { data: savedData, error } = await supabase
          .from('employees')
          .insert(newEmployees)
          .select();

        if (error) throw error;

        setEmployees([...savedData, ...employees]); // Update UI
        alert(`✅ Berhasil import ${savedData.length} data!`);
      } catch (error) {
        alert('Gagal Import ke Database: ' + error.message);
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = null; // Reset input
  };

  // --- 6. FILTERING UI ---
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (emp.email && emp.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartemen = filterDepartemen === 'all' || emp.departemen === filterDepartemen;
    return matchesSearch && matchesDepartemen;
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Manajemen Karyawan</h1>
          <p className="text-gray-600">Total: {employees.length} Karyawan</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
           <button onClick={handleDownloadTemplate} className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm">
            <FileSpreadsheet className="w-4 h-4 text-green-600" /> Template
          </button>
          <label className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm cursor-pointer">
            <Upload className="w-4 h-4 text-blue-600" /> Import
            <input type="file" accept=".xlsx, .xls" onChange={handleImportExcel} className="hidden" />
          </label>
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>
      </div>

      {/* FILTER & ADD BAR */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input type="text" placeholder="Cari nama..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 pr-4 py-2 border rounded-lg text-sm w-full md:w-64" />
          </div>
          <select value={filterDepartemen} onChange={(e) => setFilterDepartemen(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
            <option value="all">Semua Dept</option>
            {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
          </select>
        </div>
        <button onClick={() => setShowForm(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Tambah Karyawan
        </button>
      </div>

      {/* FORM INPUT MODAL (INLINE) */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">{isEditing ? 'Edit Data Karyawan' : 'Input Karyawan Baru'}</h3>
              <button onClick={resetForm}><X className="w-5 h-5 text-gray-500 hover:text-red-500" /></button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Nama Lengkap *</label>
                <input name="nama" value={formData.nama} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="Cth: Budi Santoso" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email</label>
                <input name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="email@kantor.com" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Departemen *</label>
                <select name="departemen" value={formData.departemen} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
                  <option value="">- Pilih -</option>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Posisi *</label>
                <input name="posisi" value={formData.posisi} onChange={handleInputChange} className="w-full p-2 border rounded-lg" placeholder="Cth: Manager" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} className="w-full p-2 border rounded-lg bg-white">
                  <option value="Aktif">Aktif</option>
                  <option value="Cuti">Cuti</option>
                  <option value="Resign">Resign</option>
                </select>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button onClick={resetForm} className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg text-sm font-medium">Batal</button>
              <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium flex items-center gap-2">
                {isSaving ? 'Menyimpan...' : <><Save className="w-4 h-4" /> Simpan Data</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE DATA */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Nama / Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Departemen</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Posisi</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.length === 0 ? (
                <tr><td colSpan="5" className="px-6 py-8 text-center text-gray-400">Belum ada data karyawan.</td></tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{emp.nama}</div>
                      <div className="text-xs text-gray-500">{emp.email}</div>
                    </td>
                    <td className="px-6 py-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium">{emp.departemen}</span></td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.posisi}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'Aktif' ? 'bg-green-100 text-green-700' : 
                        emp.status === 'Cuti' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => openEditForm(emp)} className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(emp.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Hapus"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeManagement;