package com.igrium.fse.util;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Consumer;

public class EventDispatcher <T> {
    protected Map<T, Collection<Consumer<?>>> consumers = new HashMap<>();

    protected void addListener(T event, Consumer<?> listener) {
        Collection<Consumer<?>> listeners = consumers.get(event);
        if (listeners == null) {
            listeners = new ArrayList<>();
            consumers.put(event, listeners);
        }

        listeners.add(listener);
    }

    /**
     * Remove an event listener from this dispatcher. Only removes the first
     * instance of the listener found.
     * 
     * @param listener The listener to remove.
     * @return If an instance of this listener was found.
     */
    protected boolean removeListener(Consumer<?> listener) {
        for (Collection<Consumer<?>> collection : consumers.values()) {
            if (collection.remove(listener)) return true;
        }
        return false;
    }

    @SuppressWarnings("unchecked") // Cast should never fail.
    protected void fireEvent(T event, Object eventObj) {
        Collection<Consumer<?>> listeners = consumers.get(event);
        if (listeners == null) return;

        for (Consumer<?> listener : listeners) {
            ((Consumer<Object>) listener).accept(eventObj);
        }
    }

}
