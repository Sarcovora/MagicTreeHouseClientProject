// src/components/common/InfoField.jsx
import PropTypes from "prop-types";

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
