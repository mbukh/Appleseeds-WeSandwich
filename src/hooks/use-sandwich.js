import { useState, useCallback, useEffect, useRef } from "react";

import { debug } from "../constants";

import { ingredientTypes } from "../constants";

import {
    readSandwichById,
    addSandwichToCurrentUser,
    readLatestSandwiches,
    readBestSandwiches,
    readSandwichesOfCurrentUser,
    readSandwichesOfUserById,
    updateSandwichVotesCount,
    readSandwichFromLocalStorage,
    updateSandwichToLocalStorage,
    deleteSandwichFromLocalStorage,
} from "../services/apiSandwiches";

import {
    didUserVotedForSandwichByIdUsingLocalStorage,
    updateCurrentUserFavoriteSandwiches,
} from "../services/apiUsers";

const useSandwich = () => {
    const [currentIngredientType, setCurrentIngredientType] = useState("bread");
    const [isSavingSandwich, setIsSavingSandwich] = useState(false);
    const [sandwich, setSandwich] = useState({});
    const [sandwichName, setSandwichName] = useState("");
    const [gallerySandwiches, setGallerySandwiches] = useState(null);
    const timeout = useRef(null);

    useEffect(() => {
        const cachedSandwich = readSandwichFromLocalStorage();
        debug && console.log("Sandwich retrieved from cache:", cachedSandwich);
        setSandwich(cachedSandwich || {});
        setSandwichName(cachedSandwich?.name || "");
    }, [isSavingSandwich]);

    useEffect(() => {
        if (!isSavingSandwich) return;
        updateSandwichToLocalStorage({ ...sandwich, name: sandwichName });
    }, [isSavingSandwich, sandwich, sandwichName]);

    const updateLocalSandwich = (sandwich) => {
        updateSandwichToLocalStorage(sandwich);
    };

    const fetchUserSandwiches = useCallback(async (uid = null) => {
        const sandwichesData = uid
            ? await readSandwichesOfUserById(uid)
            : await readSandwichesOfCurrentUser();
        debug && console.log("User sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);

    const fetchLatestSandwiches = useCallback(async (count = 30) => {
        const sandwichesData = await readLatestSandwiches(count);
        debug && console.log("Latest sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);

    const fetchBestSandwiches = useCallback(async (count = 30) => {
        const sandwichesData = await readBestSandwiches(count);
        debug && console.log("Best sandwiches:", sandwichesData);
        setGallerySandwiches(sandwichesData);
    }, []);

    const addLikeToSandwich = async (sandwichId) => {
        await updateSandwichVotesCount(sandwichId);
    };

    const hasUserVotedUserForSandwich = useCallback((sandwich, user) => {
        if (!user.uid) return didUserVotedForSandwichByIdUsingLocalStorage(sandwich.id);
        return user.info?.favoriteSandwiches?.includes(sandwich.id);
    }, []);

    const voteForSandwich = useCallback(async (sandwichId) => {
        await updateCurrentUserFavoriteSandwiches(sandwichId);
        await updateSandwichVotesCount(sandwichId);
    }, []);

    const fetchSandwich = useCallback(async (sandwichId) => {
        const sandwichData = await readSandwichById(sandwichId);
        setSandwich(sandwichData);
        debug && console.log("Sandwich:", sandwichData);
    }, []);

    const updateSandwich = useCallback(
        async (newSandwichData) => {
            timeout.current && clearTimeout(timeout.current);
            timeout.current = setTimeout(() => {
                updateSandwichToLocalStorage({
                    ...sandwich,
                    ...newSandwichData,
                    name: sandwichName,
                });
            }, 200);
            setSandwich((prev) => ({
                ...prev,
                ...newSandwichData,
            }));
        },
        [sandwich, sandwichName]
    );

    const clearSandwich = useCallback(() => {
        setSandwich({});
        setSandwichName("");
        setCurrentIngredientType("");
        deleteSandwichFromLocalStorage();
        setTimeout(() => {
            setCurrentIngredientType("bread");
        }, 400);
    }, []);

    const saveSandwich = useCallback(async () => {
        setIsSavingSandwich(true);
        debug && console.log("Adding a sandwich to current user.");
        const newSandwichId = await addSandwichToCurrentUser({
            ...sandwich,
            name: sandwichName,
        });
        if (!newSandwichId) return null;
        clearSandwich();
        setIsSavingSandwich(false);
        return newSandwichId;
    }, [clearSandwich, sandwich, sandwichName]);

    return {
        ingredientTypes,
        currentIngredientType,
        setCurrentIngredientType,
        sandwich,
        setSandwich,
        updateSandwich,
        clearSandwich,
        sandwichName,
        setSandwichName,
        saveSandwich,
        isSavingSandwich,
        setIsSavingSandwich,
        gallerySandwiches,
        setGallerySandwiches,
        fetchUserSandwiches,
        fetchLatestSandwiches,
        fetchBestSandwiches,
        fetchSandwich,
        addLikeToSandwich,
        hasUserVotedUserForSandwich,
        voteForSandwich,
        updateLocalSandwich,
    };
};

export default useSandwich;
