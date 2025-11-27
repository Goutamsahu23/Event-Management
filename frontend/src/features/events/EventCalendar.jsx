
import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import dayjs from "dayjs";
import { formatInTimezone } from "../../utils/time";

export default function EventCalendar({
  events = [],
  viewerTimezone = "UTC",
  onSelectEvent,
}) {
  const calendarEvents = useMemo(() => {
    return events.map((evt) => ({
      id: evt._id,
      title: evt.title || "(No title)",
      start: evt.startUTC,
      end: evt.endUTC,
      extendedProps: { original: evt },
    }));
  }, [events]);

  const handleEventClick = (info) => {
    const evt = info.event.extendedProps.original;
    if (onSelectEvent) onSelectEvent(evt);
  };

  return (
    <div className="calendar-wrapper">
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "",
        }}
        events={calendarEvents}
        eventClick={handleEventClick}
        height="100%"
      />
    </div>
  );
}
