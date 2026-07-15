interface InviteEarnProps {
  onInvite?: () => void;
}

const InviteEarn = ({ onInvite }: InviteEarnProps) => {
  return (
    <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/30">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Invite & Earn</h3>
          <p className="text-xs text-text-secondary mb-3">
            Invite your friends and earn exciting rewards!
          </p>
          <button
            onClick={onInvite}
            className="bg-primary text-bg px-4 py-2 rounded-full text-xs font-bold active-scale"
          >
            Invite Now
          </button>
        </div>
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
            />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default InviteEarn;
