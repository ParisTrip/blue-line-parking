interface Props {
  onClose: () => void;
}

const BACKUP_OPTIONS = [
  {
    name: 'CTA Jefferson Park Park & Ride',
    desc: 'Official CTA parking facility near the station.',
    url: 'https://www.transitchicago.com/parking/',
  },
  {
    name: 'ParkChicago - Find Parking',
    desc: 'Find paid on-street parking zones nearby.',
    url: 'https://parkchicago.com/',
  },
  {
    name: 'SpotHero',
    desc: 'Search for nearby parking garages and lots.',
    url: 'https://spothero.com/search?latitude=41.9706&longitude=-87.7608',
  },
];

export function BackupParking({ onClose }: Props) {
  return (
    <div className="bottom-sheet">
      <div className="bottom-sheet__header">
        <h3>Backup Parking Options</h3>
        <button className="bottom-sheet__close" onClick={onClose}>Close</button>
      </div>
      <div className="bottom-sheet__body">
        <p className="backup-note">
          These are paid alternatives when free street parking is not available.
        </p>
        {BACKUP_OPTIONS.map((opt) => (
          <div key={opt.name} className="backup-option">
            <div className="backup-option__name">{opt.name}</div>
            <div className="backup-option__desc">{opt.desc}</div>
            <a
              className="backup-option__link"
              href={opt.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
