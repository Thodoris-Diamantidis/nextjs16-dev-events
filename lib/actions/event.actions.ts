'use server';
import { Event } from '@/database'
import {connectToDatabase} from "@/lib/mongodb";

export const getSimilarEventsBySlug = async (slug: string) => {
    try{
        await connectToDatabase();
        const event = await Event.findOne({slug});

        if (!event) {
            console.error("Event not found");
            return [];
        }

        return await Event.find({
            _id : { $ne: event._id },
            tags: { $in: event.tags},
        }).limit(6).lean();

    } catch {
        return [];
    }
}