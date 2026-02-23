import mongoose, { Schema, type HydratedDocument, type Model, Types } from "mongoose";

import { Event } from "./event.model";

export type BookingRecord = {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
};

export type BookingDocument = HydratedDocument<BookingRecord>;

function isValidEmail(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const email = value.trim().toLowerCase();

  // Practical email validation: enough to catch common invalid inputs without being overly strict.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const bookingSchema = new Schema<BookingRecord>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: isValidEmail,
        message: "email must be a valid email address",
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
);

bookingSchema.pre("save", async function () {
  // Enforce referential integrity: ensure the booking references an existing Event.
  if (this.isNew || this.isModified("eventId")) {
    const exists = await Event.exists({ _id: this.eventId });
    if (!exists) {
      throw new Error(`Event not found for eventId: ${String(this.eventId)}`);
    }
  }
});

bookingSchema.index({ eventId: 1 });

export const Booking: Model<BookingRecord> =
  mongoose.models.Booking ??
  mongoose.model<BookingRecord>("Booking", bookingSchema);
