// ---------------------------------------------------------------------------
// FormCraft – Typed event bus
// ---------------------------------------------------------------------------

import type { FormEventName, FormEventPayloadMap } from "../types/form";

type EventHandler<E extends FormEventName> = (payload: FormEventPayloadMap[E]) => void;

export interface EventBus {
    on: <E extends FormEventName>(event: E, handler: EventHandler<E>) => () => void;
    emit: <E extends FormEventName>(event: E, payload: FormEventPayloadMap[E]) => void;
}

export function createEventBus(): EventBus {
    const handlers = new Map<FormEventName, Set<EventHandler<FormEventName>>>();

    function on<E extends FormEventName>(event: E, handler: EventHandler<E>): () => void {
        if (!handlers.has(event)) {
            handlers.set(event, new Set());
        }
        const set = handlers.get(event);
        if (!set) return () => {};
        set.add(handler as EventHandler<FormEventName>);
        return () => {
            set.delete(handler as EventHandler<FormEventName>);
        };
    }

    function emit<E extends FormEventName>(event: E, payload: FormEventPayloadMap[E]): void {
        const set = handlers.get(event);
        if (set) {
            for (const handler of set) {
                handler(payload);
            }
        }
    }

    return { on, emit };
}
