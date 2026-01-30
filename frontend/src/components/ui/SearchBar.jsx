// /Users/sahils/Desktop/clientProject/clientProject/frontend/src/components/SearchBar.jsx
/**
 * SearchBar - Input component for searching/filtering data
 * 
 * Simple wrapper around a controlled input.
 * 
 * @param {object} props
 * @param {string} props.value - Current search term
 * @param {function} props.onChange - Callback(newValue) when input changes
 */
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