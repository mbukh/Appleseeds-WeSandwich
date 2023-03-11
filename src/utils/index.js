export const trimObjectEmptyProperties = (obj) =>
    Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));

export const capitalizeFirst = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

export const capitalize = (str) => str.replace(/\b\w/g, (l) => l.toUpperCase());

export const assembleImageSrc = ({
    sandwich,
    ingredients,
    ingredientType,
    proteinPortion,
    optionSize,
}) => {
    const ingredient = ingredients[ingredientType].find(
        (ingredient) => ingredient.id === sandwich[ingredientType]
    );
    const folder = "/assets/images/ingredients/";
    const filenameBase = ingredient.imageBase;
    const breadShape =
        ingredients["bread"].find((bread) => bread.id === sandwich?.bread)?.shape ||
        "round";
    const extension = ".png";
    const suffix = {
        bread: ["", "sliced"][+(Object.values(sandwich).filter((x) => !!x).length > 1)],
        protein: breadShape + ingredient[proteinPortion],
        cheese: breadShape + ingredient[optionSize],
        toppings: breadShape + ingredient[optionSize],
        condiments: breadShape + ingredient[optionSize],
    };
    return folder + filenameBase + suffix[ingredientType] + extension;
};
