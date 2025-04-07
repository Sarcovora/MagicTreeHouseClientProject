import PropTypes from "prop-types";

/**
 * UserAvatar component displays a user's avatar or their initials if no avatar is available
 */
const UserAvatar = ({ name, size = 40, image = null }) => {
  // Generate initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Generate a consistent background color based on the name
  const getBackgroundColor = (name) => {
    if (!name) return "#CCCCCC";

    // Simple hash function to generate a number from a string
    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Use a predefined set of colors that match your design
    const colors = [
      "#68D391", // green
      "#4FD1C5", // teal
      "#76A9FA", // blue
      "#9F7AEA", // purple
      "#F687B3", // pink
      "#FC8181", // red
      "#F6AD55", // orange
      "#F6E05E", // yellow
    ];

    return colors[Math.abs(hash) % colors.length];
  };

  const initials = getInitials(name);
  const bgColor = getBackgroundColor(name);
  const fontSize = Math.max(size / 2.5, 12); // Scale font size with avatar size

  if (image) {
    return (
      <img
        src={image}
        alt={name}
        className="rounded-full object-cover"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  return (
    <div
      className="rounded-full flex items-center justify-center text-white font-medium"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: bgColor,
        fontSize: `${fontSize}px`,
      }}
    >
      {initials}
    </div>
  );
};

UserAvatar.propTypes = {
  name: PropTypes.string.isRequired,
  size: PropTypes.number,
  image: PropTypes.string,
};

export default UserAvatar;
