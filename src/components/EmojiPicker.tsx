import { useState, useRef, useEffect } from "react";
import { Smile } from "lucide-react";

const EMOJI_CATEGORIES = [
  {
    name: "Smileys",
    emojis: ["😀","😃","😄","😁","😆","😅","🤣","😂","🙂","😊","😇","🥰","😍","🤩","😘","😗","😚","😙","🥲","😋","😛","😜","🤪","😝","🤑","🤗","🤭","🫢","🤫","🤔","🫡","🤐","🤨","😐","😑","😶","🫥","😏","😒","🙄","😬","🤥","😌","😔","😪","🤤","😴","😷","🤒","🤕","🤢","🤮","🥵","🥶","🥴","😵","🤯","🤠","🥳","🥸","😎","🤓","🧐"]
  },
  {
    name: "Gestos",
    emojis: ["👍","👎","👊","✊","🤛","🤜","👏","🙌","🫶","👐","🤲","🤝","🙏","✌️","🤞","🫰","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","🫳","🫴","👋","🤏","✍️","💪","🦾","🦿"]
  },
  {
    name: "Corações",
    emojis: ["❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💔","❤️‍🔥","❤️‍🩹","❣️","💕","💞","💓","💗","💖","💘","💝","💟"]
  },
  {
    name: "Objetos",
    emojis: ["📎","📋","📝","✏️","📌","📍","🔗","📁","📂","🗂️","📅","📆","📊","📈","📉","💊","🩺","🩻","💉","🏥","🔔","🔕","📢","📣","⏰","⏳","📱","💻","🖥️","📞"]
  },
];

interface Props {
  onSelect: (emoji: string) => void;
}

export default function EmojiPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-muted-foreground hover:text-foreground transition-colors"
        title="Emoji"
      >
        <Smile className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute bottom-8 right-0 z-50 w-72 bg-card border border-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Category tabs */}
          <div className="flex border-b border-border">
            {EMOJI_CATEGORIES.map((cat, i) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(i)}
                className={`flex-1 py-1.5 text-[10px] font-medium transition-colors ${activeCategory === i ? "text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
          {/* Emoji grid */}
          <div className="p-2 max-h-44 overflow-y-auto">
            <div className="grid grid-cols-8 gap-0.5">
              {EMOJI_CATEGORIES[activeCategory].emojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { onSelect(emoji); setOpen(false); }}
                  className="h-8 w-8 flex items-center justify-center rounded hover:bg-secondary text-lg transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
