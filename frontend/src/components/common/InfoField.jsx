// src/components/common/InfoField.jsx
import PropTypes from "prop-types";

/**
 * InfoField - Labeled field for displaying a single piece of information
 * 
 * Can optionally render the value as a clickable link. 
 * Displays a placeholder text when the value is empty/null/undefined.
 * Typically used inside an InfoCard for structured data display.
 * 
 * @param {object} props
 * @param {string} props.label - The field label (displayed in uppercase)
 * @param {string|number} [props.value] - The field value to display
 * @param {string} [props.href] - Optional URL to make the value a clickable link
 * @param {string} [props.valueClassName] - Additional CSS classes for the value text
 * @param {string} [props.placeholder="Not provided"] - Text to show when value is empty
 */
const InfoField = ({
  label,
  value,
  href,
  valueClassName = "",
  placeholder = "Not provided",
}) => {
  const displayValue =
    value === null || value === undefined || value === ""
      ? placeholder
      : value;

  const content = href ? (
    <a
      href={href}
      className={`mt-1 text-sm font-medium text-gray-700 transition hover:text-green-600 ${valueClassName}`}
    >
      {displayValue}
    </a>
  ) : (
    <span
      className={`mt-1 text-sm font-medium text-gray-700 ${valueClassName}`}
    >
      {displayValue}
    </span>
  );

  return (
    <div className="flex flex-col rounded-lg border bg-gray-50 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-gray-500">
        {label}
      </span>
      {content}
    </div>
  );
};

InfoField.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  href: PropTypes.string,
  valueClassName: PropTypes.string,
  placeholder: PropTypes.string,
};

export default InfoField;
