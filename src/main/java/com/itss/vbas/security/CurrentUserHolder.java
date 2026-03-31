package com.itss.vbas.security;

public final class CurrentUserHolder {

    private static final ThreadLocal<CurrentUser> CURRENT_USER = new ThreadLocal<>();

    private CurrentUserHolder() {
    }

    public static void set(CurrentUser currentUser) {
        CURRENT_USER.set(currentUser);
    }

    public static CurrentUser get() {
        return CURRENT_USER.get();
    }

    public static void clear() {
        CURRENT_USER.remove();
    }
}
