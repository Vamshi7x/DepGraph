import { useNavigate } from 'react-router-dom';

export default function PathDisplay({ chain = [] }) {
  const navigate = useNavigate();

  if (chain.length === 0) return null;

  return (
    <div className="path-display">
      {chain.map((name, i) => (
        <span key={`${name}-${i}`} style={{ display: 'contents' }}>
          <span
            className={`path-node ${i === 0 ? 'start' : i === chain.length - 1 ? 'end' : ''}`}
            onClick={() => navigate(`/package/${encodeURIComponent(name)}`)}
          >
            {name}
          </span>
          {i < chain.length - 1 && <span className="path-arrow">→</span>}
        </span>
      ))}
    </div>
  );
}
