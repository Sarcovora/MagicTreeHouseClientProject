// src/components/common/InfoCard.jsx
import PropTypes from "prop-types";

/**
 * InfoCard - Reusable card container for displaying grouped information
 * 
 * Has an optional title and provides consistent styling with rounded corners and shadow.
 * Commonly used for "Project Information", "Client Details", etc.
 * 
 * @param {object} props
 * @param {string} [props.title] - Optional card header title
 * @param {React.ReactNode} props.children - Content to display inside the card
 * @param {string} [props.className] - Additional CSS classes for the outer container
 * @param {string} [props.bodyClassName] - Additional CSS classes for the body content
 */
const InfoCard = ({
  title,
  children,
  className = "",
  bodyClassName = "",
}) => (
  <div className={`rounded-lg bg-white p-6 shadow-sm ${className}`}>
    {title && (
      <h2 className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
    )}
    <div className={`space-y-3 ${bodyClassName}`}>{children}</div>
  </div>
);

InfoCard.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
};

export default InfoCard;
