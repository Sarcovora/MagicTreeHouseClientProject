// /Users/sahils/Desktop/clientProject/clientProject/frontend/src/components/SearchBar.jsx
const SearchBar = ({ value, onChange }) => {
  return (
    <input
      type="text"
      placeholder="Search..."
      className="w-full p-2 border border-gray-300 rounded-lg"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export default SearchBar;