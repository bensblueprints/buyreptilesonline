const dbPromise = require('./db');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// All animals scraped from backwaterreptiles.com organized by category
const animals = {
  // SNAKES (category: Snakes)
  snakes: [
    // Ball Pythons
    { name: 'Ball Python', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Classic ball python with beautiful wild-type coloring. Docile temperament, perfect for beginners.' },
    { name: 'Albino Ball Python', price: 199.99, compare: 249.99, morph: 'Albino', desc: 'Striking amelanistic ball python with bright yellow and white pattern. Red eyes.' },
    { name: 'Black Pastel Ball Python', price: 99.99, compare: 129.99, morph: 'Black Pastel', desc: 'Rich dark coloring with subtle blushing. Excellent breeding potential.' },
    { name: 'Fire Ball Python', price: 99.99, compare: 129.99, morph: 'Fire', desc: 'Bright golden coloring with clean pattern. Great combo gene for breeding projects.' },
    { name: 'Pastel Ball Python', price: 79.99, compare: 99.99, morph: 'Pastel', desc: 'Beautiful pastel morph with bright yellows and blushed head. Perfect starter morph.' },
    { name: 'Piebald Ball Python', price: 374.99, compare: 449.99, morph: 'Piebald', desc: 'Stunning piebald with unpigmented white sections. One of the most sought-after morphs.' },
    { name: 'Pinstripe Ball Python', price: 124.99, compare: 159.99, morph: 'Pinstripe', desc: 'Thin, reduced pattern with golden-brown coloring. Dominant gene with great combos.' },
    { name: 'Spider Ball Python', price: 149.99, compare: 189.99, morph: 'Spider', desc: 'Unique web-like pattern with golden base color. Eye-catching display animal.' },
    { name: 'Spinner Ball Python', price: 124.99, compare: 159.99, morph: 'Spinner', desc: 'Spider x Pinstripe combo morph with incredibly reduced pattern and bright coloring.' },
    { name: 'Yellow Bellied Ball Python', price: 79.99, compare: 99.99, morph: 'Yellow Belly', desc: 'Clean flames and bright belly. Excellent breeding potential with ivory super form.' },
    { name: 'Woma Ball Python', price: 329.99, compare: 399.99, morph: 'Woma', desc: 'Banded pattern resembling the Woma python. Stunning and highly sought after.' },
    { name: 'Pastel Superstripe Ball Python', price: 174.99, compare: 219.99, morph: 'Pastel Superstripe', desc: 'Combination morph with dramatic striping and pastel coloring.' },
    { name: 'Black Pastel Ghost Ball Python', price: 179.99, compare: 229.99, morph: 'Black Pastel Ghost', desc: 'Dark ghostly coloring with black pastel influence. Incredible visual appeal.' },
    { name: 'Leucistic Blue Eyed Ball Python', price: 349.99, compare: 449.99, morph: 'BEL', desc: 'Pure white snake with striking blue eyes. The crown jewel of ball python morphs.' },
    { name: 'Banana Pastel Calico Ball Python', price: 249.99, compare: 319.99, morph: 'Banana Pastel Calico', desc: 'Triple combo morph with lavender, yellow, and random white patches.' },
    { name: 'Orange Ghost Ball Python', price: 149.99, compare: 189.99, morph: 'Orange Ghost', desc: 'Vivid orange coloring with hypo influence. Beautiful and easy to breed.' },

    // Corn Snakes
    { name: 'Corn Snake', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Classic corn snake with beautiful red-orange saddle markings. Hardy and easy to care for.' },
    { name: 'Albino Corn Snake', price: 69.99, compare: 89.99, morph: 'Albino', desc: 'Amelanistic corn snake with bright red, orange, and yellow coloring.' },
    { name: 'Fire Corn Snake', price: 109.99, compare: 139.99, morph: 'Fire', desc: 'Intense red coloring throughout the body. Selectively bred for maximum color.' },
    { name: 'Ultra Corn Snake', price: 79.99, compare: 99.99, morph: 'Ultra', desc: 'Unique gene that creates a smoother, more vivid appearance.' },
    { name: 'Crimson Corn Snake', price: 69.99, compare: 89.99, morph: 'Crimson', desc: 'Deep crimson red coloring. Miami phase locality corn snake.' },
    { name: 'Blood Red Corn Snake', price: 79.99, compare: 99.99, morph: 'Blood Red', desc: 'Deep red coloring that intensifies with age. Pattern reduces over time.' },
    { name: 'Lavender Blood Red Corn Snake', price: 89.99, compare: 109.99, morph: 'Lavender Blood Red', desc: 'Stunning lavender-pink base with blood red influence.' },
    { name: 'Sunkissed Corn Snake', price: 89.99, compare: 109.99, morph: 'Sunkissed', desc: 'Unique pattern mutation with rounded saddle markings and warm tones.' },
    { name: 'Snow Corn Snake', price: 99.99, compare: 129.99, morph: 'Snow', desc: 'White and pink coloring. Combination of amelanistic and anerythristic genes.' },
    { name: 'Blizzard Corn Snake', price: 149.99, compare: 189.99, morph: 'Blizzard', desc: 'Pure white corn snake. Charcoal and amelanistic combination.' },
    { name: 'Ghost Corn Snake', price: 99.99, compare: 119.99, morph: 'Ghost', desc: 'Subtle pastel coloring with hypo and anerythristic influence.' },
    { name: 'Tessera Corn Snake', price: 99.99, compare: 129.99, morph: 'Tessera', desc: 'Unique dorsal stripe pattern mutation. Highly sought after.' },
    { name: 'Motley Corn Snake', price: 69.99, compare: 89.99, morph: 'Motley', desc: 'Connected saddle markings creating a unique ladder-like pattern.' },

    // Boas
    { name: 'Colombian Red Tail Boa', price: 149.99, compare: 199.99, morph: 'Normal', desc: 'Classic Colombian boa with rich saddle markings. Hardy and impressive species.' },
    { name: 'Kenyan Sand Boa', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'Small, docile burrowing boa. Perfect for keepers with limited space.' },
    { name: 'Brazilian Rainbow Boa', price: 299.99, compare: 379.99, morph: 'Normal', desc: 'Iridescent scales that shimmer in rainbow colors. Absolutely stunning species.' },
    { name: 'Central American Boa', price: 109.99, compare: 139.99, morph: 'Normal', desc: 'Smaller locality boa with beautiful pattern. Great intermediate species.' },
    { name: 'Rosy Boa', price: 189.99, compare: 229.99, morph: 'Normal', desc: 'Beautiful three-striped pattern. One of the best pet boas available.' },
    { name: 'Amazon Tree Boa', price: 79.99, compare: 109.99, morph: 'Normal', desc: 'Arboreal boa with incredible color variation. Active display animal.' },
    { name: 'Dumerils Boa', price: 189.99, compare: 239.99, morph: 'Normal', desc: 'Beautiful ground boa from Madagascar. Docile and easy to keep.' },
    { name: 'Emerald Tree Boa', price: 299.99, compare: 399.99, morph: 'Normal', desc: 'Stunning bright green arboreal boa. The jewel of any collection.' },
    { name: 'Albino Colombian Red Tail Boa', price: 279.99, compare: 349.99, morph: 'Albino', desc: 'Amelanistic Colombian boa with bright pink, orange, and white coloring.' },
    { name: 'Hog Island Boa', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Dwarf locality boa with beautiful pastel coloring. Naturally small.' },
    { name: 'Guyana Red Tail Boa', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'True red tail boa with vivid red tail markings. Impressive species.' },
    { name: 'Viper Boa', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Unique rough-scaled boa that resembles a viper. Fascinating species.' },

    // Kingsnakes
    { name: 'California Kingsnake', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Classic banded kingsnake. Hardy, easy to care for, and beautiful.' },
    { name: 'Mexican Black Kingsnake', price: 209.99, compare: 269.99, morph: 'Normal', desc: 'Jet black coloring from head to tail. Sleek and stunning.' },
    { name: 'High White California Kingsnake', price: 139.99, compare: 179.99, morph: 'High White', desc: 'Wide white bands with reduced black. Eye-catching pattern.' },
    { name: 'Eastern Chain Kingsnake', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Beautiful chain-link pattern. Classic eastern species.' },
    { name: 'Albino California Kingsnake', price: 99.99, compare: 129.99, morph: 'Albino', desc: 'Bright white and yellow banded pattern. Amelanistic beauty.' },
    { name: 'Brooks Kingsnake', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Florida locality with speckled pattern. Unique and beautiful.' },
    { name: 'Gray Banded Kingsnake', price: 249.99, compare: 299.99, morph: 'Normal', desc: 'Highly variable gray and orange banding. Prized collector species.' },
    { name: 'Desert Kingsnake', price: 129.99, compare: 159.99, morph: 'Normal', desc: 'Beautiful speckled pattern from the American southwest.' },

    // Pythons
    { name: 'Carpet Python', price: 159.99, compare: 199.99, morph: 'Normal', desc: 'Beautiful patterned python from Australia. Active and impressive species.' },
    { name: 'Spotted Python', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Small Australian python with spotted pattern. Great pet species.' },
    { name: 'Childrens Python', price: 189.99, compare: 239.99, morph: 'Normal', desc: 'Small, docile python perfect for beginners. Named after John George Children.' },
    { name: 'Green Tree Python', price: 349.99, compare: 449.99, morph: 'Normal', desc: 'Stunning bright green arboreal python. The crown jewel of any collection.' },
    { name: 'Woma Python', price: 299.99, compare: 379.99, morph: 'Normal', desc: 'Beautiful banded Australian python. Docile and easy to handle.' },
    { name: 'Red Blood Python', price: 99.99, compare: 139.99, morph: 'Normal', desc: 'Thick-bodied python with deep red coloring. Impressive display animal.' },
    { name: 'Black Blood Python', price: 159.99, compare: 199.99, morph: 'Normal', desc: 'Dark melanistic blood python. Jet black coloring.' },
    { name: 'Diamond Python', price: 499.99, compare: 649.99, morph: 'Normal', desc: 'Stunning Australian python with diamond-shaped markings on black background.' },
    { name: 'Angolan Python', price: 449.99, compare: 549.99, morph: 'Normal', desc: 'Rare and beautiful python species. Highly sought after by collectors.' },

    // Rat Snakes
    { name: 'Yellow Rat Snake', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Bright yellow-green rat snake. Active and impressive climber.' },
    { name: 'Black Rat Snake', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Classic black rat snake. Hardy and adaptable species.' },
    { name: 'Texas Rat Snake', price: 89.99, compare: 109.99, morph: 'Normal', desc: 'Beautiful leucistic and normal morphs available. Great display animal.' },
    { name: 'Beauty Rat Snake', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Stunning Asian rat snake with striped pattern and beautiful coloring.' },
    { name: 'Mandarin Rat Snake', price: 299.99, compare: 379.99, morph: 'Normal', desc: 'Gorgeous orange and black patterned snake. One of the most beautiful rat snakes.' },
    { name: 'Leucistic Rat Snake', price: 174.99, compare: 219.99, morph: 'Leucistic', desc: 'Pure white rat snake with blue eyes. Captive bred blue-eyed leucistic.' },

    // Milk Snakes
    { name: 'Pueblan Milk Snake', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Classic tri-color milk snake with red, black, and white banding.' },
    { name: 'Honduran Milk Snake', price: 179.99, compare: 229.99, morph: 'Normal', desc: 'Largest milk snake species with vibrant tangerine coloring. Impressive display.' },
    { name: 'Sinaloan Milk Snake', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Wide red bands with clean black and white borders. Beautiful species.' },
    { name: 'Albino Sinaloan Milk Snake', price: 119.99, compare: 149.99, morph: 'Albino', desc: 'Amelanistic Sinaloan with bright orange-red and white banding.' },
    { name: 'Nelsons Milk Snake', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Classic Mexican milk snake with bold tri-color pattern.' },

    // Garter Snakes
    { name: 'Garter Snake', price: 24.99, compare: 34.99, morph: 'Normal', desc: 'Classic garter snake. Hardy, diurnal, and easy to care for.' },
    { name: 'Ribbon Snake', price: 39.99, compare: 49.99, morph: 'Normal', desc: 'Slender, striped snake closely related to garter snakes. Active and curious.' },
    { name: 'Albino Checkered Garter Snake', price: 199.99, compare: 249.99, morph: 'Albino', desc: 'Stunning albino checkered garter with golden coloring.' },

    // Other Snakes
    { name: 'Western Hognose Snake', price: 109.99, compare: 149.99, morph: 'Normal', desc: 'Adorable upturned nose and dramatic death-feigning behavior. Excellent pet.' },
    { name: 'Eastern Hognose Snake', price: 129.99, compare: 169.99, morph: 'Normal', desc: 'Master of dramatic defensive displays. Fascinating species.' },
    { name: 'Sunbeam Snake', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Iridescent scales that shimmer in rainbow colors. Burrowing species.' },
    { name: 'Gopher Snake', price: 129.99, compare: 159.99, morph: 'Normal', desc: 'Large, impressive colubrid. Hardy and great for intermediate keepers.' },
    { name: 'Egg Eating Snake', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Unique snake that feeds exclusively on eggs. Fascinating species.' },
    { name: 'African House Snake', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Small, docile, and easy to care for. Perfect beginner snake.' },
    { name: 'Mangrove Snake', price: 149.99, compare: 199.99, morph: 'Normal', desc: 'Striking black and yellow banded rear-fanged snake. Beautiful display animal.' },
    { name: 'Mexican Black Kingsnake', price: 179.99, compare: 229.99, morph: 'Normal', desc: 'Jet black from head to tail. Sleek, beautiful, and easy to care for.' },
  ],

  // GECKOS (category: Geckos)
  geckos: [
    // Leopard Geckos
    { name: 'Leopard Gecko', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Classic leopard gecko. The most popular pet gecko species in the world.' },
    { name: 'Albino Leopard Gecko', price: 34.99, compare: 44.99, morph: 'Albino', desc: 'Amelanistic leopard gecko with bright yellow and lavender coloring.' },
    { name: 'Super Snow Leopard Gecko', price: 59.99, compare: 79.99, morph: 'Super Snow', desc: 'Pure white base with bold black spotting. Eclipse eyes possible.' },
    { name: 'Blizzard Leopard Gecko', price: 39.99, compare: 54.99, morph: 'Blizzard', desc: 'Patternless morph ranging from white to purple-gray.' },
    { name: 'Blazing Blizzard Leopard Gecko', price: 54.99, compare: 69.99, morph: 'Blazing Blizzard', desc: 'Albino Blizzard combo creating a pure white gecko with red eyes.' },
    { name: 'Mack Snow Leopard Gecko', price: 39.99, compare: 54.99, morph: 'Mack Snow', desc: 'Reduced yellow with white and black banding as babies. Stunning morph.' },
    { name: 'Enigma Leopard Gecko', price: 39.99, compare: 54.99, morph: 'Enigma', desc: 'Random spotting and unique pattern. No two look alike.' },
    { name: 'Tangerine Leopard Gecko', price: 59.99, compare: 79.99, morph: 'Tangerine', desc: 'Bright orange tangerine coloring throughout the body.' },
    { name: 'Giant Leopard Gecko', price: 99.99, compare: 129.99, morph: 'Giant', desc: 'Super-sized leopard gecko genetics. Grows up to 12 inches.' },
    { name: 'Super Giant Leopard Gecko', price: 124.99, compare: 159.99, morph: 'Super Giant', desc: 'The largest leopard geckos in the world. Up to 13 inches long.' },
    { name: 'Sunglow Leopard Gecko', price: 39.99, compare: 54.99, morph: 'Sunglow', desc: 'Bright yellow and orange with no dark spots. SHTCT and Tremper albino combo.' },
    { name: 'Pinstripe Leopard Gecko', price: 49.99, compare: 64.99, morph: 'Pinstripe', desc: 'Bold dorsal stripe with clean lateral markings.' },
    { name: 'Leucistic Leopard Gecko', price: 44.99, compare: 59.99, morph: 'Leucistic', desc: 'Reduced pigmentation with pale, ghostly appearance.' },

    // Other Geckos
    { name: 'Crested Gecko', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Eyelash crested gecko. No heat lamp needed, easy to care for. Eats fruit-based diet.' },
    { name: 'Gargoyle Gecko', price: 139.99, compare: 179.99, morph: 'Normal', desc: 'Bumpy-headed New Caledonian gecko. Hardy and beautiful species.' },
    { name: 'Fat Tail Gecko', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'African fat-tailed gecko. Docile temperament, similar care to leopard geckos.' },
    { name: 'Giant Day Gecko', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Brilliant neon green Madagascar gecko. Active daytime display animal.' },
    { name: 'Tokay Gecko', price: 44.99, compare: 59.99, morph: 'Normal', desc: 'Vibrant blue and orange gecko. Bold personality and impressive size.' },
    { name: 'Satanic Leaf-Tailed Gecko', price: 799.99, compare: 999.99, morph: 'Normal', desc: 'Incredible leaf-mimicking gecko from Madagascar. Master of camouflage.' },
    { name: 'New Caledonian Giant Gecko', price: 399.99, compare: 499.99, morph: 'Normal', desc: 'The largest gecko species in the world. Impressive size and personality.' },
    { name: 'Mossy Leaf-Tailed Gecko', price: 199.99, compare: 259.99, morph: 'Normal', desc: 'Perfect bark and moss camouflage. Incredible species from Madagascar.' },
    { name: 'Williams Blue Cave Gecko', price: 174.99, compare: 219.99, morph: 'Normal', desc: 'Electric blue dwarf gecko. Males are stunning cobalt blue.' },
    { name: 'Gold Dust Day Gecko', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Bright green with gold speckling. Active and beautiful display species.' },
    { name: 'Peacock Day Gecko', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Beautiful day gecko with four eye-like spots. Stunning patterns.' },
    { name: 'Flying Gecko', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Webbed feet and skin flaps allow gliding. Incredible camouflage.' },
    { name: 'Chinese Cave Gecko', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Stunning banded cave gecko. Hardy and easy to breed.' },
    { name: 'Frog Eye Gecko', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Large-eyed desert gecko. Unique appearance and easy care.' },
    { name: 'Cat Gecko', price: 119.99, compare: 149.99, morph: 'Normal', desc: 'Curls up like a cat when sleeping. Unique and fascinating species.' },
    { name: 'Australian Barking Gecko', price: 159.99, compare: 199.99, morph: 'Normal', desc: 'Knob-tailed gecko that barks when threatened. Fascinating species.' },
    { name: 'Banded Knob-Tailed Gecko', price: 179.99, compare: 229.99, morph: 'Normal', desc: 'Beautiful banded pattern with distinctive knob tail. Australian species.' },
  ],

  // ISOPODS (keep existing)

  // TURTLES (new category)
  turtles: [
    { name: 'Yellow Bellied Slider', price: 24.99, compare: 34.99, morph: 'Normal', desc: 'Classic aquatic turtle with bright yellow belly. Hardy and active.' },
    { name: 'Red Eared Slider', price: 19.99, compare: 29.99, morph: 'Normal', desc: 'The most popular pet turtle in the world. Active and personable.' },
    { name: 'Albino Red Eared Slider', price: 59.99, compare: 79.99, morph: 'Albino', desc: 'Stunning amelanistic slider with bright yellow and white coloring.' },
    { name: 'Three Striped Mud Turtle', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Small mud turtle with three distinctive head stripes. Great for smaller setups.' },
    { name: 'Western Painted Turtle', price: 24.99, compare: 34.99, morph: 'Normal', desc: 'Colorful painted turtle with vibrant red and yellow markings.' },
    { name: 'Eastern Painted Turtle', price: 34.99, compare: 44.99, morph: 'Normal', desc: 'Beautiful painted turtle with red marginal scute markings.' },
    { name: 'Musk Turtle', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Tiny turtle that stays small. Perfect for desktop aquariums.' },
    { name: 'Mississippi Map Turtle', price: 24.99, compare: 34.99, morph: 'Normal', desc: 'Intricate map-like pattern on shell and skin. Active swimmer.' },
    { name: 'Florida Snapping Turtle', price: 29.99, compare: 44.99, morph: 'Normal', desc: 'Florida subspecies of the common snapping turtle. Impressive species.' },
    { name: 'Pink Bellied Sideneck Turtle', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Vibrant pink belly with unique sideneck anatomy. Popular pet species.' },
    { name: 'Spotted Turtle', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Small semi-aquatic turtle with yellow polka dots on black shell.' },
    { name: 'Eastern Box Turtle', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Classic box turtle with hinged shell. Can live 50+ years.' },
    { name: 'Ornate Box Turtle', price: 249.99, compare: 299.99, morph: 'Normal', desc: 'Beautifully patterned box turtle with radiating yellow lines.' },
    { name: 'Three Toed Box Turtle', price: 249.99, compare: 299.99, morph: 'Normal', desc: 'Hardy box turtle species with three toes on rear feet. Long-lived.' },
    { name: 'Mata Mata Turtle', price: 349.99, compare: 449.99, morph: 'Normal', desc: 'Bizarre leaf-mimicking turtle from South America. Ambush predator.' },
    { name: 'Chinese Box Turtle', price: 299.99, compare: 379.99, morph: 'Normal', desc: 'Beautiful Asian box turtle with yellow head markings.' },
    { name: 'Golden Thread Turtle', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Attractive aquatic turtle with golden stripes on head and neck.' },
    { name: 'Reeves Turtle', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Small Asian turtle that stays manageable size. Three-keeled shell.' },
    { name: 'Razor Backed Musk Turtle', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Distinctive high-domed shell with razor-like keel. Unique appearance.' },
    { name: 'Blandings Turtle', price: 299.99, compare: 379.99, morph: 'Normal', desc: 'Semi-aquatic turtle with bright yellow chin and throat. Gentle species.' },
    { name: 'Spiny Softshell Turtle', price: 34.99, compare: 49.99, morph: 'Normal', desc: 'Unique soft-shelled turtle with snorkel-like nose. Fast swimmer.' },
    { name: 'Florida Softshell Turtle', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Large softshell turtle native to Florida. Active and unique.' },
    { name: 'Black Knobbed Map Turtle', price: 209.99, compare: 269.99, morph: 'Normal', desc: 'Striking map turtle with pronounced knobs on the keel of the shell.' },
    { name: 'Albino Snapping Turtle', price: 4499.99, compare: 5499.99, morph: 'Albino', desc: 'Extremely rare amelanistic snapping turtle. One of the rarest turtles available.' },
  ],

  // TORTOISES (new category)
  tortoises: [
    { name: 'Sulcata Tortoise', price: 129.99, compare: 169.99, morph: 'Normal', desc: 'Third largest tortoise species in the world. Hardy and personable. Can live 100+ years.' },
    { name: 'Greek Tortoise', price: 169.99, compare: 219.99, morph: 'Normal', desc: 'Medium-sized Mediterranean tortoise. Hardy and great for outdoor keeping.' },
    { name: 'Red Foot Tortoise', price: 149.99, compare: 189.99, morph: 'Normal', desc: 'Beautiful red and orange scales on legs. Tropical species that thrives in humidity.' },
    { name: 'Cherry Head Red Foot Tortoise', price: 249.99, compare: 319.99, morph: 'Cherry Head', desc: 'Vibrant cherry red head coloring. The most colorful tortoise available.' },
    { name: 'Hermans Tortoise', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Classic European tortoise with beautiful shell pattern. Medium size.' },
    { name: 'Leopard Tortoise', price: 239.99, compare: 299.99, morph: 'Normal', desc: 'Stunning leopard-spot pattern on high-domed shell. African species.' },
    { name: 'Sri Lankan Star Tortoise', price: 599.99, compare: 749.99, morph: 'Normal', desc: 'Beautiful radiating star pattern on each scute. Highly prized species.' },
    { name: 'Russian Tortoise', price: 599.99, compare: 749.99, morph: 'Normal', desc: 'Hardy, small tortoise perfect for temperate climates. Easy to care for.' },
    { name: 'Pancake Tortoise', price: 599.99, compare: 749.99, morph: 'Normal', desc: 'Flat, flexible-shelled tortoise that hides in rock crevices. Unique species.' },
    { name: 'Burmese Mountain Tortoise', price: 359.99, compare: 449.99, morph: 'Normal', desc: 'Fourth largest tortoise species. Impressive size and gentle temperament.' },
    { name: 'Elongated Tortoise', price: 239.99, compare: 299.99, morph: 'Normal', desc: 'Elongated shell shape with beautiful caramel coloring. Forest species.' },
    { name: 'Marginated Tortoise', price: 229.99, compare: 289.99, morph: 'Normal', desc: 'Largest European tortoise with flared rear marginal scutes.' },
    { name: 'Yellow Foot Tortoise', price: 149.99, compare: 189.99, morph: 'Normal', desc: 'Yellow scales on legs and head. Closely related to red foot tortoise.' },
    { name: 'Homes Hingeback Tortoise', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'Unique hinged rear shell allows it to close like a box turtle.' },
    { name: 'Forest Hingeback Tortoise', price: 149.99, compare: 189.99, morph: 'Normal', desc: 'Larger hingeback species from African forests. Hardy once established.' },
  ],

  // CHAMELEONS (new category)
  chameleons: [
    { name: 'Veiled Chameleon', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Most popular pet chameleon. Tall casque and beautiful green coloring.' },
    { name: 'Panther Chameleon', price: 499.99, compare: 649.99, morph: 'Normal', desc: 'The most colorful chameleon species. Incredible locale-specific colors.' },
    { name: 'Jacksons Chameleon', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'Three-horned chameleon resembling a mini triceratops. Live-bearing species.' },
    { name: 'Translucent Veiled Chameleon', price: 149.99, compare: 199.99, morph: 'Translucent', desc: 'Translucent skin morph allowing you to see internal structures.' },
    { name: 'Carpet Chameleon', price: 159.99, compare: 199.99, morph: 'Normal', desc: 'Small, beautiful chameleon with intricate patterns. From Madagascar.' },
    { name: 'Pygmy Chameleon', price: 159.99, compare: 199.99, morph: 'Normal', desc: 'Tiny leaf chameleons. Can be kept in naturalistic terrariums.' },
    { name: 'Four-Horned Chameleon', price: 249.99, compare: 319.99, morph: 'Normal', desc: 'Rare chameleon with four horns and a sailfin crest. Impressive display.' },
    { name: 'Parsons Chameleon', price: 2299.99, compare: 2799.99, morph: 'Normal', desc: 'The largest chameleon species in the world. Incredibly rare and impressive.' },
    { name: 'Mellers Chameleon', price: 169.99, compare: 219.99, morph: 'Normal', desc: 'Large chameleon with single horn. The "giant one-horned chameleon."' },
    { name: 'Sambava Panther Chameleon', price: 299.99, compare: 389.99, morph: 'Sambava', desc: 'Red and green locale of panther chameleon. Stunning coloring.' },
    { name: 'Oustalets Chameleon', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'One of the largest chameleon species. Hardy and impressive.' },
    { name: 'Werners Chameleon', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Small horned chameleon from Tanzania. Live-bearing species.' },
    { name: 'Flapneck Chameleon', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Hardy African chameleon with distinctive neck flaps.' },
    { name: 'Sailfin Chameleon', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'Impressive sailfin crest on back. Unique and fascinating species.' },
    { name: 'Elephant Eared Chameleon', price: 149.99, compare: 189.99, morph: 'Normal', desc: 'Large ear-like occipital lobes. Beautiful Madagascar species.' },
  ],

  // FROGS (new category - Tree Frogs + Other Frogs + Dart Frogs)
  frogs: [
    { name: 'Whites Tree Frog', price: 24.99, compare: 34.99, morph: 'Normal', desc: 'The most popular pet tree frog. Docile, hardy, and adorable dumpy body.' },
    { name: 'Red Eye Tree Frog', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Iconic frog with brilliant red eyes and green body. Stunning display animal.' },
    { name: 'Amazon Milk Frog', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Beautiful blue and brown banded tree frog. Hardy and great for groups.' },
    { name: 'Waxy Monkey Tree Frog', price: 129.99, compare: 169.99, morph: 'Normal', desc: 'Waxy-skinned frog that walks instead of hopping. Unique species.' },
    { name: 'Mossy Tree Frog', price: 199.99, compare: 259.99, morph: 'Normal', desc: 'Incredible moss-like camouflage. One of the most stunning frogs available.' },
    { name: 'Clown Tree Frog', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Brightly patterned small tree frog. Active and colorful.' },
    { name: 'Green Tree Frog', price: 19.99, compare: 29.99, morph: 'Normal', desc: 'Classic bright green tree frog. Easy to care for and great for beginners.' },
    { name: 'Gray Tree Frog', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Master of camouflage that changes from gray to green. Hardy species.' },
    { name: 'White Lipped Tree Frog', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'The largest tree frog species in the world. Impressive size.' },
    { name: 'Borneo Eared Tree Frog', price: 74.99, compare: 99.99, morph: 'Normal', desc: 'Beautiful frog with distinctive ear-like projections above the eyes.' },
    { name: 'Glass Tree Frog', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Transparent belly skin reveals internal organs. Fascinating species.' },
    { name: 'Tiger Leg Tree Frog', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Beautiful orange and black striped legs. Active monkey frog relative.' },
    { name: 'Pacman Frog', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Round, voracious frog that resembles Pac-Man. Easy to care for.' },
    { name: 'Albino Pacman Frog', price: 29.99, compare: 39.99, morph: 'Albino', desc: 'Amelanistic Pacman frog in strawberry and apricot color forms.' },
    { name: 'Fantasy Pacman Frog', price: 32.99, compare: 44.99, morph: 'Fantasy', desc: 'Hybrid Pacman frog with ornate patterns and unique coloring.' },
    { name: 'Pixie Frog', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'African bullfrog that grows massive. Second largest frog species.' },
    { name: 'Tomato Frog', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Bright red-orange frog from Madagascar. Unique and beautiful.' },
    { name: 'Budgetts Frog', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Bizarre flat frog that screams when disturbed. Fascinating species.' },
    { name: 'Rain Frog', price: 109.99, compare: 139.99, morph: 'Normal', desc: 'Round, adorable frog that makes squeaking sounds. Internet famous species.' },
    { name: 'Ornate Horned Frog', price: 24.99, compare: 34.99, morph: 'Normal', desc: 'Beautiful horned frog with vibrant green and red coloring.' },
    { name: 'Solomon Island Leaf Frog', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Unique frog that develops directly from egg - no tadpole stage.' },
    { name: 'Leopard Frog', price: 24.99, compare: 34.99, morph: 'Normal', desc: 'Classic spotted frog. Hardy and great for semi-aquatic setups.' },
    { name: 'Blue Poison Dart Frog', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Stunning cobalt blue dart frog. Safe in captivity. Vivarium centerpiece.' },
    { name: 'Strawberry Poison Dart Frog', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Bright red dart frog also called the "blue jeans frog."' },
    { name: 'Green and Black Poison Dart Frog', price: 54.99, compare: 69.99, morph: 'Normal', desc: 'Hardy dart frog with metallic green and black pattern. Great starter dart frog.' },
    { name: 'Bumble Bee Poison Dart Frog', price: 84.99, compare: 109.99, morph: 'Normal', desc: 'Yellow and black banded dart frog. Bold and beautiful.' },
    { name: 'Dyeing Poison Dart Frog', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Largest dart frog species with incredible color variation.' },
  ],

  // TOADS (new category)
  toads: [
    { name: 'Fire Bellied Toad', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Bright red and black belly pattern. Active, semi-aquatic, and easy to keep.' },
    { name: 'Cane Toad', price: 19.99, compare: 29.99, morph: 'Normal', desc: 'The largest toad species. Impressive size and hardy constitution.' },
    { name: 'Colorado River Toad', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Largest North American toad species. Impressive and fascinating.' },
    { name: 'Surinam Toad', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Bizarre flat aquatic toad. Babies emerge from mothers back. Incredible.' },
    { name: 'Bumble Bee Toad', price: 139.99, compare: 179.99, morph: 'Normal', desc: 'Tiny black and yellow toad. Beautiful and rare species.' },
    { name: 'Leaf Toad', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Master of disguise that looks exactly like a dead leaf.' },
    { name: 'Chilean Wide Mouthed Toad', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Second largest frog/toad in the world. Incredible specimen.' },
    { name: 'Smooth Sided Toad', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Large South American toad with smooth skin. Impressive species.' },
  ],

  // SALAMANDERS & NEWTS (new category)
  salamanders: [
    { name: 'Axolotl', price: 39.99, compare: 54.99, morph: 'Wild Type', desc: 'The famous Mexican walking fish. Aquatic salamander that stays in larval form.' },
    { name: 'Leucistic Axolotl', price: 59.99, compare: 79.99, morph: 'Leucistic', desc: 'White axolotl with dark eyes. The most popular axolotl morph.' },
    { name: 'Melanoid Axolotl', price: 59.99, compare: 79.99, morph: 'Melanoid', desc: 'Jet black aquatic salamander. Striking dark coloring throughout.' },
    { name: 'Tiger Salamander', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Large, bold-patterned salamander. Hardy and great for beginners.' },
    { name: 'Spotted Salamander', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Beautiful yellow-spotted black salamander. Classic American species.' },
    { name: 'Fire Salamander', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Stunning black and yellow pattern. The most recognized salamander species.' },
    { name: 'Marbled Salamander', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Beautiful silver and black marbled pattern. Hardy species.' },
    { name: 'Fire Bellied Newt', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Bright orange belly with dark topside. Popular aquatic pet.' },
    { name: 'Alpine Newt', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Stunning blue and orange coloring in breeding season. Rare in the hobby.' },
    { name: 'Iranian Kaiser Newt', price: 149.99, compare: 199.99, morph: 'Normal', desc: 'The rarest newt in the world. Black and white spotted beauty.' },
    { name: 'Marbled Newt', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Green marbled pattern on black. Stunning European species.' },
    { name: 'Spanish Ribbed Newt', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Large aquatic newt. Can push ribs through skin as defense mechanism.' },
    { name: 'Chinese Emperor Newt', price: 149.99, compare: 189.99, morph: 'Normal', desc: 'Impressive knobby-skinned newt with orange markings. Prehistoric appearance.' },
    { name: 'Eastern Newt', price: 39.99, compare: 49.99, morph: 'Normal', desc: 'Goes through dramatic life stages from red eft to green adult.' },
  ],

  // MONITORS & TEGUS (new category)
  monitors: [
    { name: 'Savannah Monitor', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Most popular pet monitor lizard. Hardy and can be tamed with regular handling.' },
    { name: 'Nile Monitor', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Impressive African monitor that grows large. Active and intelligent.' },
    { name: 'Water Monitor', price: 199.99, compare: 259.99, morph: 'Normal', desc: 'One of the longest lizards in the world. Semi-aquatic and intelligent.' },
    { name: 'Black Throat Monitor', price: 499.99, compare: 649.99, morph: 'Normal', desc: 'Large African monitor with dark throat. Can be very docile when tamed.' },
    { name: 'Green Tree Monitor', price: 674.99, compare: 849.99, morph: 'Normal', desc: 'Stunning bright green arboreal monitor. Prehensile tail for climbing.' },
    { name: 'Argus Monitor', price: 449.99, compare: 549.99, morph: 'Normal', desc: 'Beautiful spotted monitor. Active, intelligent, and can be tamed.' },
    { name: 'Ackie Monitor', price: 499.99, compare: 649.99, morph: 'Normal', desc: 'Small, spiny-tailed monitor perfect for those who want a mini monitor.' },
    { name: 'Timor Monitor', price: 199.99, compare: 259.99, morph: 'Normal', desc: 'Small monitor lizard from Timor. Great for intermediate keepers.' },
    { name: 'Crocodile Monitor', price: 2299.99, compare: 2799.99, morph: 'Normal', desc: 'The longest lizard in the world. Arboreal with incredible tail length.' },
    { name: 'Mangrove Monitor', price: 229.99, compare: 299.99, morph: 'Normal', desc: 'Beautiful semi-aquatic monitor. Hardy and interesting species.' },
    { name: 'Peach Throat Monitor', price: 399.99, compare: 499.99, morph: 'Normal', desc: 'Beautiful monitor with peach-colored throat. Hardy and impressive.' },
    { name: 'Red Tegu', price: 299.99, compare: 389.99, morph: 'Normal', desc: 'Beautiful red and white Argentine tegu. Intelligent and can be tamed like a dog.' },
    { name: 'Argentine Black and White Tegu', price: 199.99, compare: 259.99, morph: 'Normal', desc: 'The most popular pet tegu. Highly intelligent and bonds with owners.' },
    { name: 'Colombian Tegu', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'Gold and black tegu. Active and impressive South American lizard.' },
    { name: 'Caiman Lizard', price: 399.99, compare: 499.99, morph: 'Normal', desc: 'Semi-aquatic lizard that eats snails. Beautiful green and orange coloring.' },
  ],

  // BEARDED DRAGONS (new category)
  beardedDragons: [
    { name: 'Bearded Dragon', price: 54.99, compare: 69.99, morph: 'Normal', desc: 'The most popular pet lizard in the world. Friendly, docile, and easy to care for.' },
    { name: 'Red Bearded Dragon', price: 89.99, compare: 119.99, morph: 'Red', desc: 'Selectively bred for vibrant red coloring throughout the body.' },
    { name: 'Citrus Bearded Dragon', price: 89.99, compare: 119.99, morph: 'Citrus', desc: 'Bright yellow-orange citrus coloring. Stunning and vibrant.' },
    { name: 'Translucent Bearded Dragon', price: 99.99, compare: 129.99, morph: 'Translucent', desc: 'Semi-transparent skin with solid dark eyes. Unique and beautiful morph.' },
    { name: 'Leatherback Bearded Dragon', price: 89.99, compare: 119.99, morph: 'Leatherback', desc: 'Smooth-scaled morph with reduced spikes. Vibrant coloring.' },
    { name: 'Zero Bearded Dragon', price: 149.99, compare: 199.99, morph: 'Zero', desc: 'Completely patternless morph. Clean solid coloring throughout.' },
    { name: 'Hypo Bearded Dragon', price: 79.99, compare: 99.99, morph: 'Hypo', desc: 'Reduced melanin creating lighter, brighter coloring and clear nails.' },
    { name: 'Witblits Bearded Dragon', price: 129.99, compare: 169.99, morph: 'Witblits', desc: 'Patternless morph from South Africa. Subtle, clean appearance.' },
  ],

  // TARANTULAS (new category)
  tarantulas: [
    { name: 'Mexican Redknee Tarantula', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Classic pet tarantula with orange knee patches. Docile and long-lived.' },
    { name: 'Goliath Bird Eating Tarantula', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'The largest spider in the world. Leg span over 12 inches.' },
    { name: 'Brazilian Black Tarantula', price: 109.99, compare: 139.99, morph: 'Normal', desc: 'Jet black and incredibly docile. The perfect pet tarantula.' },
    { name: 'Cobalt Blue Tarantula', price: 49.99, compare: 69.99, morph: 'Normal', desc: 'Stunning metallic blue coloring. Beautiful but defensive species.' },
    { name: 'Mexican Fireleg Tarantula', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Bright orange-red leg patches on velvet black body. Stunning display.' },
    { name: 'Gooty Sapphire Ornamental', price: 149.99, compare: 199.99, morph: 'Normal', desc: 'Stunning metallic blue and yellow pattern. One of the most beautiful spiders.' },
    { name: 'Pink Toe Tarantula', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Arboreal tarantula with pink toe tips. Great beginner species.' },
    { name: 'Antilles Pink Toe Tarantula', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Metallic blue-green juveniles that mature to purple-red. Stunning species.' },
    { name: 'Curly Hair Tarantula', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Fluffy, curly-haired tarantula. Very docile and easy to keep.' },
    { name: 'Rose Hair Tarantula', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Classic Chilean rose tarantula. One of the most popular pet spiders.' },
    { name: 'Greenbottle Blue Tarantula', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Blue legs, green carapace, orange abdomen. The most colorful tarantula.' },
    { name: 'King Baboon Tarantula', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'Large burrowing African tarantula. Impressive size and presence.' },
    { name: 'Chaco Golden Knee Tarantula', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Docile species with golden knee patches. Excellent pet tarantula.' },
    { name: 'Socotra Island Blue Baboon', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Stunning blue coloring from Socotra Island. Communal species.' },
    { name: 'Venezuelan Suntiger Tarantula', price: 79.99, compare: 99.99, morph: 'Normal', desc: 'Beautiful orange and black chevron pattern. Fast-moving arboreal species.' },
    { name: 'Pumpkin Patch Tarantula', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Tiny dwarf tarantula with orange pumpkin-like patches on abdomen.' },
    { name: 'Brazilian Giant Salmon Tarantula', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'One of the largest tarantula species. Pink-salmon coloring in females.' },
    { name: 'Goliath Pinkfoot Tarantula', price: 129.99, compare: 169.99, morph: 'Normal', desc: 'Second largest spider in the world. Pink toe pads on massive legs.' },
    { name: 'Horned Baboon Tarantula', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Horn-like protrusion on carapace. Unique and fascinating species.' },
    { name: 'Singapore Blue Tarantula', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Massive arboreal tarantula with electric blue coloring. Impressive species.' },
  ],

  // SCORPIONS (new category)
  scorpions: [
    { name: 'Emperor Scorpion', price: 69.99, compare: 89.99, morph: 'Normal', desc: 'The most popular pet scorpion. Large, impressive, and relatively docile.' },
    { name: 'Asian Forest Scorpion', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Large forest scorpion similar to emperor scorpions. Hardy and easy to keep.' },
    { name: 'Desert Hairy Scorpion', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Largest scorpion in North America. Desert-dwelling species.' },
    { name: 'Flat Rock Scorpion', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Extremely flat scorpion that hides in rock crevices. Unique appearance.' },
    { name: 'Dictator Scorpion', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Massive African scorpion. One of the largest species in the world.' },
    { name: 'Arizona Bark Scorpion', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'The most venomous scorpion in North America. For experienced keepers only.' },
    { name: 'Giant Vinegaroon', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Also called whip scorpion. Sprays vinegar-like acid when threatened.' },
  ],

  // INSECTS & INVERTEBRATES (new category)
  insects: [
    { name: 'Vietnamese Centipede', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Large tropical centipede with impressive speed and size.' },
    { name: 'Halloween Moon Crab', price: 34.99, compare: 44.99, morph: 'Normal', desc: 'Stunning purple and orange land crab. Beautiful display animal.' },
    { name: 'Vampire Crab', price: 19.99, compare: 29.99, morph: 'Normal', desc: 'Tiny bright-colored land crab. Perfect for paludarium setups.' },
    { name: 'Hermit Crab', price: 19.99, compare: 29.99, morph: 'Normal', desc: 'Classic pet hermit crab. Fun, social, and easy to care for.' },
    { name: 'Regal Jumping Spider', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Adorable jumping spider with big eyes and curious personality.' },
    { name: 'Florida Millipede', price: 14.99, compare: 19.99, morph: 'Normal', desc: 'Giant millipede. Gentle and fascinating invertebrate pet.' },
    { name: 'Texas Red Headed Centipede', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Impressive large centipede with red head and black body. For advanced keepers.' },
    { name: 'Camel Spider', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Fast-moving solifuge also called wind scorpion. Fascinating arachnid.' },
    { name: 'Trapdoor Spider', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Builds camouflaged burrow with hinged door. Ambush predator.' },
  ],

  // AGAMAS & WATER DRAGONS (new category)
  agamas: [
    { name: 'Chinese Water Dragon', price: 24.99, compare: 39.99, morph: 'Normal', desc: 'Beautiful green lizard that loves to swim. Can grow over 3 feet.' },
    { name: 'Frilled Dragon', price: 349.99, compare: 449.99, morph: 'Normal', desc: 'Iconic lizard that opens a dramatic neck frill when threatened.' },
    { name: 'Red Headed Agama', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Males sport bright orange-red heads and blue bodies. Stunning display.' },
    { name: 'Sailfin Dragon', price: 179.99, compare: 229.99, morph: 'Normal', desc: 'Impressive lizard with large sailfin on tail. Semi-aquatic species.' },
    { name: 'Spiderman Agama', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Bright blue and red coloring resembling Spider-Man. Eye-catching species.' },
    { name: 'Mountain Horn Lizard', price: 19.99, compare: 29.99, morph: 'Normal', desc: 'Small dragon-like lizard with horn-like projections. Easy to keep.' },
    { name: 'Shield Tailed Agama', price: 449.99, compare: 549.99, morph: 'Normal', desc: 'Tiny agama with shield-shaped tail. Rare and fascinating species.' },
    { name: 'Toad Head Agama', price: 179.99, compare: 229.99, morph: 'Normal', desc: 'Bizarre lizard with toad-like head and tail curling display. Unique species.' },
  ],

  // SKINKS (new category)
  skinks: [
    { name: 'Blue Tongue Skink', price: 249.99, compare: 319.99, morph: 'Normal', desc: 'Iconic lizard with bright blue tongue threat display. Docile and hardy.' },
    { name: 'Red Eye Crocodile Skink', price: 199.99, compare: 259.99, morph: 'Normal', desc: 'Armored mini-dragon with bright red eye ring. Incredible appearance.' },
    { name: 'Fire Skink', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Vibrant red, gold, and black coloring. One of the most colorful skinks.' },
    { name: 'Peters Banded Skink', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'Unique desert skink with bold banded pattern. Hardy species.' },
    { name: 'Pink Tongue Skink', price: 274.99, compare: 349.99, morph: 'Normal', desc: 'Australian skink with distinctive pink tongue. Related to blue tongues.' },
    { name: 'Schneiders Skink', price: 59.99, compare: 79.99, morph: 'Normal', desc: 'Beautiful orange-sided desert skink. Active and interesting species.' },
  ],

  // UROMASTYX (new category)
  uromastyx: [
    { name: 'Yellow Niger Uromastyx', price: 89.99, compare: 119.99, morph: 'Normal', desc: 'Bright yellow spiny-tailed lizard. Herbivorous and heat-loving.' },
    { name: 'Red Niger Uromastyx', price: 119.99, compare: 149.99, morph: 'Normal', desc: 'Vibrant red coloring in mature males. Stunning desert species.' },
    { name: 'Egyptian Uromastyx', price: 149.99, compare: 199.99, morph: 'Normal', desc: 'Largest uromastyx species. Impressive size and gentle temperament.' },
    { name: 'Moroccan Uromastyx', price: 199.99, compare: 249.99, morph: 'Normal', desc: 'Beautiful yellow and green spiny-tailed lizard from North Africa.' },
    { name: 'Mali Uromastyx', price: 149.99, compare: 199.99, morph: 'Normal', desc: 'Hardy uromastyx species great for beginners. Bright yellow in males.' },
    { name: 'Ornate Uromastyx', price: 199.99, compare: 259.99, morph: 'Normal', desc: 'Most colorful uromastyx with blue, orange, and green coloring.' },
    { name: 'Arabian Blue Uromastyx', price: 299.99, compare: 379.99, morph: 'Normal', desc: 'Stunning blue coloring. One of the rarest uromastyx in the hobby.' },
    { name: 'Ocellated Uromastyx', price: 249.99, compare: 319.99, morph: 'Normal', desc: 'Beautiful eye-spot pattern. Medium-sized and colorful.' },
  ],

  // OTHER LIZARDS (new category)
  otherLizards: [
    { name: 'Green Iguana', price: 44.99, compare: 59.99, morph: 'Normal', desc: 'Classic pet iguana. Can grow over 5 feet. Impressive and herbivorous.' },
    { name: 'Red Iguana', price: 89.99, compare: 119.99, morph: 'Red', desc: 'Selectively bred red morph iguana. Beautiful rusty red coloring.' },
    { name: 'Blue Axanthic Iguana', price: 119.99, compare: 149.99, morph: 'Blue Axanthic', desc: 'Stunning blue coloring lacking yellow pigment. Highly sought after.' },
    { name: 'Rhinoceros Iguana', price: 399.99, compare: 499.99, morph: 'Normal', desc: 'Horn-bearing iguana from the Caribbean. Impressive and prehistoric-looking.' },
    { name: 'Green Anole', price: 15.99, compare: 19.99, morph: 'Normal', desc: 'Classic American anole that changes color. Perfect starter lizard.' },
    { name: 'Cuban Knight Anole', price: 34.99, compare: 44.99, morph: 'Normal', desc: 'Large green anole species. Impressive size and bold personality.' },
    { name: 'Green Basilisk', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'The Jesus Christ lizard - can run on water. Impressive display animal.' },
    { name: 'Flying Dragon Lizard', price: 99.99, compare: 129.99, morph: 'Normal', desc: 'Incredible gliding lizard with wing-like rib extensions. Fascinating.' },
    { name: 'Armadillo Lizard', price: 109.99, compare: 139.99, morph: 'Normal', desc: 'Curls into a ball like an armadillo for defense. Unique and fascinating.' },
    { name: 'Jewelled Lacerta', price: 149.99, compare: 189.99, morph: 'Normal', desc: 'Stunning green lizard with blue eye spots. The most beautiful European lizard.' },
    { name: 'Sudan Plated Lizard', price: 139.99, compare: 179.99, morph: 'Normal', desc: 'Large plated lizard with armored appearance. Hardy and easy to tame.' },
    { name: 'Emerald Swift', price: 49.99, compare: 64.99, morph: 'Normal', desc: 'Brilliant emerald green lizard from Central America. Active and stunning.' },
    { name: 'Desert Horned Lizard', price: 39.99, compare: 54.99, morph: 'Normal', desc: 'Classic horned toad lizard. Unique flat body and horned crown.' },
    { name: 'Mexican Arboreal Alligator Lizard', price: 349.99, compare: 449.99, morph: 'Normal', desc: 'Stunning emerald green arboreal lizard. Extremely rare and beautiful.' },
    { name: 'Sandfish Lizard', price: 29.99, compare: 39.99, morph: 'Normal', desc: 'Swims through sand like a fish. Fascinating desert species.' },
  ],
};

// Category mapping for the database
const categoryMap = {
  snakes: 'Snakes',
  geckos: 'Geckos',
  turtles: 'Turtles',
  tortoises: 'Tortoises',
  chameleons: 'Chameleons',
  frogs: 'Frogs & Toads',
  toads: 'Frogs & Toads',
  salamanders: 'Salamanders & Newts',
  monitors: 'Monitors & Tegus',
  beardedDragons: 'Bearded Dragons',
  tarantulas: 'Tarantulas & Spiders',
  scorpions: 'Scorpions',
  insects: 'Insects & Invertebrates',
  agamas: 'Agamas & Water Dragons',
  skinks: 'Skinks',
  uromastyx: 'Uromastyx',
  otherLizards: 'Other Lizards & Iguanas',
};

function slugify(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

async function main() {
  const db = await dbPromise;

  // Create new categories
  const existingCats = db.prepare('SELECT slug FROM categories').all().map(c => c.slug);
  const categoryIds = {};

  // Get existing category IDs
  const allCats = db.prepare('SELECT id, name FROM categories').all();
  for (const c of allCats) categoryIds[c.name] = c.id;

  // Get max sort order
  let maxSort = db.prepare('SELECT MAX(sort_order) as m FROM categories').get().m || 5;

  // Create categories that don't exist
  const uniqueCats = [...new Set(Object.values(categoryMap))];
  for (const catName of uniqueCats) {
    if (!categoryIds[catName]) {
      const slug = slugify(catName);
      if (!existingCats.includes(slug)) {
        maxSort++;
        const result = db.prepare('INSERT INTO categories (name, slug, description, sort_order) VALUES (?, ?, ?, ?)').run(catName, slug, `${catName} for sale - captive bred, ethically sourced`, maxSort);
        categoryIds[catName] = result.lastInsertRowid;
        console.log(`Created category: ${catName} (ID: ${categoryIds[catName]})`);
      }
    }
  }

  // Reload category IDs
  const reloadedCats = db.prepare('SELECT id, name FROM categories').all();
  for (const c of reloadedCats) categoryIds[c.name] = c.id;

  // Import products
  let imported = 0;
  let skipped = 0;

  for (const [key, productList] of Object.entries(animals)) {
    const catName = categoryMap[key];
    const catId = categoryIds[catName];

    if (!catId) {
      console.log(`WARNING: No category ID for ${catName}`);
      continue;
    }

    for (const animal of productList) {
      const slug = slugify(animal.name);

      // Check if already exists
      const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(slug);
      if (existing) {
        skipped++;
        continue;
      }

      // Random stock 1-15
      const stock = Math.floor(Math.random() * 15) + 1;

      db.prepare(`INSERT INTO products (name, slug, description, price, compare_price, category_id, stock, featured, active, morph) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
        animal.name,
        slug,
        animal.desc,
        animal.price,
        animal.compare || null,
        catId,
        stock,
        Math.random() > 0.7 ? 1 : 0, // 30% chance of featured
        1,
        animal.morph || null
      );
      imported++;
    }
  }

  console.log(`\nImport complete: ${imported} products imported, ${skipped} skipped (already exist)`);
  console.log(`Total products now: ${db.prepare('SELECT COUNT(*) as c FROM products').get().c}`);
  console.log(`Total categories: ${db.prepare('SELECT COUNT(*) as c FROM categories').get().c}`);

  // Show category breakdown
  const breakdown = db.prepare('SELECT c.name, COUNT(p.id) as count FROM categories c LEFT JOIN products p ON p.category_id = c.id GROUP BY c.id ORDER BY c.sort_order').all();
  console.log('\nCategory breakdown:');
  for (const b of breakdown) {
    console.log(`  ${b.name}: ${b.count} products`);
  }
}

main().catch(console.error);
