import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './DashboardPage.css';

const DashboardPage = () => {
  const [bills, setBills] = useState([]);
  const [formData, setFormData] = useState({
    billType: 'electricity',
    billDate: '', 
    oldReading: '',
    newReading: '',
  });
  const [error, setError] = useState('');

  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const fetchBills = async () => {
    if (!userInfo) return;
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/bills', config);
      setBills(data);
    } catch (err) {
      setError('Không thể tải danh sách hóa đơn.');
    }
  };

  useEffect(() => {
    fetchBills();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleAddBill = async (e) => {
    e.preventDefault();
    setError('');
    
    const newBill = {
        ...formData,
        billDate: `${formData.billDate}-01` // Thêm "-01" để tạo thành ngày YYYY-MM-DD
    }

    try {
      const config = { 
        headers: { 
          'Content-Type': 'application/json', 
          Authorization: `Bearer ${userInfo.token}` 
        } 
      };
      
      await axios.post('/api/bills', newBill, config);
      
      fetchBills();
      // Reset form về trạng thái ban đầu
      setFormData({ billType: 'electricity', billDate: '', oldReading: '', newReading: '' }); 
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi khi thêm hóa đơn.');
    }
  };

  const handleDeleteBill = async (billId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa hóa đơn này không?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/bills/${billId}`, config);
        fetchBills();
      } catch (err) {
        setError('Lỗi khi xóa hóa đơn.');
      }
    }
  };

  const handleTogglePaidStatus = async (billId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/bills/${billId}/pay`, {}, config);
      fetchBills();
    } catch (err) {
      setError('Lỗi khi cập nhật trạng thái.');
    }
  };

  // Tách riêng bill điện và nước
  const electricityBills = useMemo(() => bills.filter(b => b.billType === 'electricity'), [bills]);
  const waterBills = useMemo(() => bills.filter(b => b.billType === 'water'), [bills]);

  // Tạo dữ liệu cho biểu đồ chung
  const combinedChartData = useMemo(() => {
    const dataMap = new Map();

    bills.forEach(bill => {
        const monthYear = new Date(bill.billDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });
        if (!dataMap.has(monthYear)) {
            dataMap.set(monthYear, { name: monthYear });
        }
        const entry = dataMap.get(monthYear);
        if (bill.billType === 'electricity') {
            entry['Tiền Điện (k VNĐ)'] = Math.round(bill.totalAmount / 1000);
        } else if (bill.billType === 'water') {
            entry['Tiền Nước (k VNĐ)'] = Math.round(bill.totalAmount / 1000);
        }
    });

    return Array.from(dataMap.values()).slice(-12);
  }, [bills]);

  const stats = useMemo(() => {
    if (bills.length === 0) return { lastElec: 0, lastWater: 0 };
    return {
      lastElec: electricityBills[0]?.totalAmount || 0,
      lastWater: waterBills[0]?.totalAmount || 0
    };
  }, [bills, electricityBills, waterBills]);

  return (
    <div className="dashboard">
      <h1>Bảng điều khiển</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Tiền Điện Gần Nhất</div>
          <div className="stat-number">{stats.lastElec.toLocaleString('vi-VN')} VNĐ</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tiền Nước Gần Nhất</div>
          <div className="stat-number">{stats.lastWater.toLocaleString('vi-VN')} VNĐ</div>
        </div>
      </div>

      <div className="card">
        <h3>Biểu đồ chi phí 12 tháng gần nhất</h3>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={combinedChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Tiền Điện (k VNĐ)" fill="#f39c12" />
              <Bar dataKey="Tiền Nước (k VNĐ)" fill="#3498db" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="card">
        <h3>Thêm Hóa Đơn Mới</h3>
        <form onSubmit={handleAddBill} className="add-bill-form">
          <div className="form-group">
            <label>Loại hóa đơn</label>
            <select name="billType" value={formData.billType} onChange={handleInputChange} required>
                <option value="electricity">Điện</option>
                <option value="water">Nước</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tháng/Năm</label>
            <input type="month" name="billDate" value={formData.billDate} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Chỉ số cũ ({formData.billType === 'water' ? 'm³' : 'kWh'})</label>
            <input type="number" name="oldReading" placeholder="VD: 1500" value={formData.oldReading} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label>Chỉ số mới ({formData.billType === 'water' ? 'm³' : 'kWh'})</label>
            <input type="number" name="newReading" placeholder="VD: 1650" value={formData.newReading} onChange={handleInputChange} required />
          </div>
          <button type="submit" className="btn-submit">Thêm</button>
        </form>
        {error && <p className="error-text">{error}</p>}
      </div>

      <div className="card">
        <h3>Lịch Sử Hóa Đơn</h3>
        <div className="table-wrapper">
            <table className="bill-table">
                <thead>
                    <tr>
                        <th>Loại</th>
                        <th>Kỳ Hóa Đơn</th>
                        <th>Tiêu thụ</th>
                        <th>Tổng tiền (VNĐ)</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {bills.length > 0 ? (
                        bills.map((bill) => (
                        <tr key={bill._id}>
                            <td className={`type-${bill.billType}`}>{bill.billType === 'water' ? 'Nước' : 'Điện'}</td>
                            <td>{new Date(bill.billDate).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' })}</td>
                            <td>{bill.totalUsage} {bill.billType === 'water' ? 'm³' : 'kWh'}</td>
                            <td>{bill.totalAmount.toLocaleString('vi-VN')}</td>
                            <td>
                                <button className={`btn-status ${bill.isPaid ? 'paid' : 'unpaid'}`} onClick={() => handleTogglePaidStatus(bill._id)}>
                                    {bill.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </button>
                            </td>
                            <td>
                                <button className="btn-delete" onClick={() => handleDeleteBill(bill._id)}>Xóa</button>
                            </td>
                        </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>Chưa có hóa đơn nào.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;