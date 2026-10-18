// ─────────────────────────────────────────────────────────────
// ✏️  EDIT ME — everything on the site is controlled from here.
// ─────────────────────────────────────────────────────────────

export const siteContent = {
  // The name that appears throughout the site.
  herName: "Cutie",

  // Shown on the very first "envelope" screen, before the reveal.
  envelope: {
    label: "A little something for you...",
    button: "Tap to open 💌",
  },

  // Hero / top section, shown right after the reveal.
  hero: {
    eyebrow: "A birthday surprise for",
    turningAge: 29,
    subheading:
      "Today the world gets to celebrate the best part of my every day.",
  },

  // The "turning 29" milestone section — one line per reason/wish.
  // Feel free to add, remove, or rewrite any of these — aim for ~10-29 of them.
  milestone: {
    heading: "29 reasons I love you",
    intro:
      "One for every year — and I could easily write twenty-nine more.",
    reasons: [
      "The way you laugh at your own jokes before you even finish telling them.",
      "How you remember the tiny things everyone else forgets.",
      "Your fierce, unstoppable kindness.",
      "The way you make any room feel like home.",
      "How you dance in the kitchen when you think no one's watching.",
      "Your terrible, wonderful puns.",
      "The way you fight for the people you love.",
      "How curious you are about absolutely everything.",
      "Your hugs that fix almost anything.",
      "The way you say my name.",
      "How brave you are, even when you don't feel it.",
      "Your ridiculously good taste in music.",
      "The way you always know when I need a coffee.",
      "How you light up talking about the things you love.",
      "Your patience with me, always.",
      "The way you make ordinary days feel like an adventure.",
      "How honest you are, even when it's hard.",
      "Your quiet strength.",
      "The way you care for everyone around you.",
      "How you make me want to be better.",
      "Your smile — first thing in the morning, especially.",
      "The way you remember every birthday, every little detail.",
      "How competitive you get over the smallest games.",
      "Your big, generous heart.",
      "The way you say 'we' instead of 'you' or 'me'.",
      "How safe I feel with you.",
      "Your endless, contagious optimism.",
      "The way you love — fully, without holding back.",
      "Simply, all of you.",
    ],
  },

  // Photo memories gallery. Drop real photos into /public/images and
  // update the `src` paths below (jpg, png, or webp all work).
  gallery: {
    heading: "A few of my favorite moments",
    intro: "Every one of these is a memory I'd relive on repeat.",
    photos: [
      { src: "/images/memory-1.svg", caption: "Add your own caption here" },
      { src: "/images/memory-2.svg", caption: "Add your own caption here" },
      { src: "/images/memory-3.svg", caption: "Add your own caption here" },
      { src: "/images/memory-4.svg", caption: "Add your own caption here" },
      { src: "/images/memory-5.svg", caption: "Add your own caption here" },
      { src: "/images/memory-6.svg", caption: "Add your own caption here" },
    ],
  },

  // The love letter section.
  loveLetter: {
    heading: "A letter for you",
    signature: "Yours, always",
    paragraphs: [
      "Happy 29th birthday, cutie. If you're reading this, it means the surprise worked — and I've been way too excited about that all day.",
      "I wanted to build you something small and a little silly, just to make you smile today. But really, this whole page is just an excuse to tell you how much you mean to me, in a way that isn't just a text.",
      "You have this way of making ordinary days feel a little brighter just by being in them — and twenty-nine looks incredible on you already.",
      "Here's to another year of your laugh filling up every room you walk into, your kindness catching people off guard, and you becoming even more unapologetically, wonderfully you.",
      "I can't wait to see what this year brings for you — and I'm so grateful I get to be there for every bit of it. I love you more than this page could ever say.",
    ],
  },

  footer: {
    line: "Made with love, just for you.",
  },

  // The private two-person chat at /chat/<ADMIN_SECRET>.
  chat: {
    heading: "Just us",
    intro: "A little private corner, just for the two of us.",
    // Shown as the sender label on her link for messages sent from your link.
    meLabel: "Me",
  },
};
