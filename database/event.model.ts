import mongoose, {
  Schema,
  type HydratedDocument,
  type Model,
} from "mongoose";

export type EventMode = "online" | "offline" | "hybrid" | (string & {});

export type EventRecord = {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // stored as ISO string
  time: string; // stored as "HH:mm" or "HH:mm-HH:mm"
  mode: EventMode;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type EventDocument = HydratedDocument<EventRecord>;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function slugifyTitle(title: string): string {
  // Lowercase + collapse non-alphanumerics into dashes to produce a URL-friendly slug.
  return title
    .trim()
    .toLowerCase()
    .replace(/['--]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

function normalizeDateToIso(dateInput: string): string {
  // Normalize to a consistent ISO string representation.
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateInput}`);
  }
  return date.toISOString().split("T")[0];
}

function parseTimeTo24h(timeInput: string): string {
  // Accept "HH:mm" (24h) or "h:mm AM/PM" (12h) and return "HH:mm".
  const trimmed = timeInput.trim();

  const m24 = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(trimmed);
  if (m24) {
    return `${m24[1]}:${m24[2]}`;
  }

  const m12 = /^(\d{1,2}):([0-5]\d)\s*(am|pm)$/i.exec(trimmed);
  if (!m12) {
    throw new Error(
      `Invalid time: ${timeInput}. Expected "HH:mm" or "h:mm AM/PM".`
    );
  }

  let hours = Number(m12[1]);
  const minutes = Number(m12[2]);
  const ampm = m12[3].toLowerCase();

  if (hours < 1 || hours > 12) {
    throw new Error(
      `Invalid time: ${timeInput}. Hour must be between 1 and 12 for AM/PM format.`
    );
  }

  if (ampm === "am") {
    hours = hours === 12 ? 0 : hours;
  } else {
    hours = hours === 12 ? 12 : hours + 12;
  }

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  return `${hh}:${mm}`;
}

function normalizeTime(timeInput: string): string {
  // Normalize time to "HH:mm" or "HH:mm-HH:mm" for time ranges.
  const trimmed = timeInput.trim();

  const parts = trimmed
    .split(/\s*-\s*/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (parts.length === 1) return parseTimeTo24h(parts[0]);
  if (parts.length === 2) {
    const start = parseTimeTo24h(parts[0]);
    const end = parseTimeTo24h(parts[1]);
    return `${start}-${end}`;
  }

  throw new Error(
    `Invalid time: ${timeInput}. Expected "HH:mm" or "HH:mm-HH:mm".`
  );
}

const eventSchema = new Schema<EventRecord>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "title is required",
      },
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "description is required",
      },
    },
    overview: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "overview is required",
      },
    },
    image: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "image is required",
      },
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "venue is required",
      },
    },
    location: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "location is required",
      },
    },
    date: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "date is required",
      },
    },
    time: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "time is required",
      },
    },
    mode: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "mode is required",
      },
    },
    audience: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "audience is required",
      },
    },
    agenda: {
      type: [String],
      required: true,
      validate: {
        validator: (value: unknown) =>
          Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString),
        message: "agenda must be a non-empty array of strings",
      },
    },
    organizer: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: isNonEmptyString,
        message: "organizer is required",
      },
    },
    tags: {
      type: [String],
      required: true,
      validate: {
        validator: (value: unknown) =>
          Array.isArray(value) && value.length > 0 && value.every(isNonEmptyString),
        message: "tags must be a non-empty array of strings",
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

eventSchema.pre("save", function () {
  // Generate/refresh slug only when the title changes.
  if (this.isModified("title") || this.isNew) {
    this.slug = slugifyTitle(this.title);
  }

  // Normalize date/time so they are always stored in a consistent format.
  this.date = normalizeDateToIso(this.date);
  this.time = normalizeTime(this.time);

  // Ensure the slug is present even if input was malformed.
  if (!isNonEmptyString(this.slug)) {
    throw new Error("Failed to generate slug from title");
  }
});

// Explicit unique index for clarity and to ensure it exists in the collection.
eventSchema.index({ slug: 1 }, { unique: true });

//Create compound index for common queries
eventSchema.index({date: 1, mode: 1});

export const Event: Model<EventRecord> =
  mongoose.models.Event ?? mongoose.model<EventRecord>("Event", eventSchema);
