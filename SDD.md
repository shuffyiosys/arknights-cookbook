## Linking Inventory back to Recipes

* A dictionary using ingredient names as the key, with the value a set that holds recipe names
* When adding a recipe to the operator card, each ingredient of that recipe is added to the dictionary, with the recipe name added to the set
* When the inventory is updated, it looks at the material in the dictionary and grabs which recipes use it
* Each recipe is checked to see if all of its ingredients are met (since there's a data base for every recipe)