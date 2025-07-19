export const EmployeeListPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Nhân viên</h1>
          <p className="text-gray-600">Quản lý danh sách nhân viên trong công ty</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Thêm Nhân viên
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <p className="text-gray-500">Danh sách nhân viên sẽ được hiển thị ở đây.</p>
        </div>
      </div>
    </div>
  );
}; 