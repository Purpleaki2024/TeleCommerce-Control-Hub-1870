// Update the menu management button to include icon
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  onClick={() => navigate('/admin/menu')}
  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors flex items-center"
>
  <FiMenu className="mr-2" />
  Manage Menus
</motion.button>