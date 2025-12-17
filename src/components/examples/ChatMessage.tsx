import ChatMessage from '../ChatMessage';

export default function ChatMessageExample() {
  return (
    <div className="p-4 max-w-2xl space-y-1">
      <ChatMessage
        message="Hi Dr. Kumar, I wanted to discuss the arrhythmia case you posted earlier. Have you considered a Holter monitor for 24-hour tracking?"
        senderName="Dr. Sarah Chen"
        timestamp="10:30 AM"
        isSent={false}
      />
      <ChatMessage
        message="That's a great suggestion! I was thinking the same. The patient's symptoms seem intermittent, so continuous monitoring would be ideal."
        senderName="Dr. Raj Kumar"
        timestamp="10:32 AM"
        isSent={true}
      />
      <ChatMessage
        message="Exactly. I've had similar cases where the Holter revealed paroxysmal atrial fibrillation that we would have missed otherwise."
        senderName="Dr. Sarah Chen"
        timestamp="10:33 AM"
        isSent={false}
      />
    </div>
  );
}
