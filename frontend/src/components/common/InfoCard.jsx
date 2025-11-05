// src/components/common/InfoCard.jsx
import PropTypes from "prop-types";

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
