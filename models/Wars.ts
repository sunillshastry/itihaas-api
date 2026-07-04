import { model, Schema } from 'mongoose';

const WarsSchema = new Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
    },

    otherNames: {
      type: [String],
      default: [],
    },

    type: {
      type: String,
      enum: ['battle', 'war', 'campaign', 'siege'],
      default: 'war',
    },

    timeline: {
      begin: {
        type: String,
      },
      end: {
        type: String,
      },
    },

    locations: {
      type: [String],
      default: [],
    },

    belligerents: [
      {
        name: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ['dynasty', 'kingdom', 'rebellion', 'coalition'],
        },
        leaders: {
          type: [String],
          default: [],
        },
      },
    ],

    outcome: {
      result: {
        type: String,
        enum: ['victory', 'defeat', 'stalemate', 'indecisive'],
      },
      winners: {
        type: [String],
        default: [],
      },
      losers: {
        type: [String],
        default: [],
      },
    },

    casualties: {
      sideA: {
        type: Number,
        default: null,
      },
      sideB: {
        type: Number,
        default: null,
      },
      notes: {
        type: String,
      },
    },

    causes: {
      type: [String],
      default: [],
    },

    relatedDynasties: {
      type: [String],
      default: [],
    },
    relatedRulers: {
      type: [String],
      default: [],
    },
    relatedWars: {
      type: [String],
      default: [],
    },

    description: {
      oneline: {
        type: String,
      },
      long: {
        type: [String],
        default: [],
      },
    },

    sources: {
      type: [String],
      default: [],
    },

    furtherReading: [
      {
        publisher: String,
        link: String,
      },
    ],

    articles: [
      {
        title: String,
        authors: {
          type: [String],
          default: [],
        },
        publisher: String,
        link: String,
      },
    ],
  },
  { timestamps: true },
);

export default model('War', WarsSchema);
