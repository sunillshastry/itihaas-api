const mongoose = require('mongoose');

// Primary Schema for Dynasty
const DynastiesSchema = mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: true,
      unique: false,
    },
    otherNames: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    timeline: {
      begin: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
      end: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
    },
    capitals: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    languages: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    religions: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    rulers: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    area: {
      lowest: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
      highest: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
    },
    population: {
      type: String,
      required: false,
      unique: false,
      default: null,
    },
    currencies: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    wars: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    locations: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    description: {
      oneline: {
        type: String,
        required: false,
        unique: false,
        default: null,
      },
      long: {
        type: [String],
        required: false,
        unique: false,
        default: [],
      },
    },
    sources: {
      type: [String],
      required: false,
      unique: false,
      default: [],
    },
    furtherReading: {
      type: Map,
      of: String,
    },
    articles: {
      type: [
        {
          title: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
          authors: {
            type: [String],
            required: false,
            unique: false,
            default: [],
          },
          publisher: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
          link: {
            type: String,
            required: false,
            unique: false,
            default: null,
          },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

const DynastiesModel = mongoose.model('Dynasty', DynastiesSchema);

module.exports = DynastiesModel;
