const WHATSAPP_URL = "#";

export default function WhatsAppFloatingButton() {
    return (
        <a
            href={WHATSAPP_URL}
            className="whatsapp-floating-btn"
            aria-label="Open WhatsApp chat"
        >
            <span className="whatsapp-floating-btn__icon-wrap" aria-hidden="true">
                <svg
                    className="whatsapp-floating-btn__icon"
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M3 21l1.65-3.8A9 9 0 1 1 12 21a8.96 8.96 0 0 1-3.95-.92L3 21z" />
                    <path d="M9 10a.5.5 0 0 0 0 1a5 5 0 0 0 5 5a.5.5 0 0 0 1 0v-1.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v.5a3 3 0 0 1-3-3h.5a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5H9z" />
                </svg>
            </span>
        </a>
    );
}
