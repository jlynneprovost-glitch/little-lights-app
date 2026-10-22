-- Six original, gentle retellings. Run after schema.sql.
-- Re-running preserves edits made through the CMS.
insert into public.stories
  (id, title, verse, description, theme, minutes, age_group, cover_scene, is_free, status, pages, quiz)
values
(
  '11111111-1111-4111-8111-111111111111',
  'Noah’s Big Adventure',
  'Genesis 6–9',
  'A little faith. A big boat. A beautiful promise.',
  'trust',
  3,
  '3–7',
  'ark',
  true,
  'published',
  '[{"text":"God asked Noah to build a very big boat.","scene":"ark"},{"text":"Noah trusted God and got to work.","scene":"ark"},{"text":"Two by two, the animals climbed aboard.","scene":"ark"},{"text":"Rain pattered softly. Everyone stayed safe inside.","scene":"ark"},{"text":"At last, a little dove found a green leaf.","scene":"ark"},{"text":"God painted a rainbow: a promise of love.","scene":"ark"},{"text":"God cares for you, through sunshine and rain.","scene":"ark"}]',
  '[{"question":"What did Noah build?","answers":["A big boat","A tall castle","A racing car"],"correctIndex":0},{"question":"What did the rainbow remind Noah of?","answers":["A tasty snack","God’s loving promise","A new toy"],"correctIndex":1}]'
),
(
  '22222222-2222-4222-8222-222222222222',
  'The Little Lost Sheep',
  'Luke 15:3–7',
  'Even the littlest lamb is loved a whole lot.',
  'love',
  3,
  '3–7',
  'sheep',
  true,
  'published',
  '[{"text":"A fluffy little sheep wandered far from home.","scene":"sheep"},{"text":"Soon, the little sheep felt all alone.","scene":"sheep"},{"text":"The kind shepherd noticed one sheep was missing.","scene":"sheep"},{"text":"He searched the hills until he heard a baa.","scene":"sheep"},{"text":"He carried the little sheep safely home.","scene":"sheep"},{"text":"You are precious to God, just like that sheep.","scene":"sheep"}]',
  '[{"question":"Who looked for the little sheep?","answers":["A kind shepherd","A sleepy fish","A busy bee"],"correctIndex":0},{"question":"How does God feel about you?","answers":["He forgets me","He loves me very much","He is too busy"],"correctIndex":1}]'
),
(
  '33333333-3333-4333-8333-333333333333',
  'A Sky Full of Promises',
  'Genesis 15:1–6',
  'Look up! God has wonderful things in store.',
  'wonder',
  3,
  '3–7',
  'stars',
  true,
  'published',
  '[{"text":"Abraham looked up at the twinkling night sky.","scene":"stars"},{"text":"God said, “Can you count all those stars?”","scene":"stars"},{"text":"Abraham tried, but there were far too many!","scene":"stars"},{"text":"God promised Abraham a great big family.","scene":"stars"},{"text":"Abraham trusted God, even while he waited.","scene":"stars"},{"text":"God keeps his promises, one beautiful day at a time.","scene":"stars"}]',
  '[{"question":"What did Abraham look at?","answers":["Shiny stars","Green apples","Red balloons"],"correctIndex":0},{"question":"What can we remember when we wait?","answers":["Promises never matter","God keeps his promises","We are alone"],"correctIndex":1}]'
),
(
  '44444444-4444-4444-8444-444444444444',
  'A World Full of Wonder',
  'Genesis 1',
  'Every flower, every creature, made with love.',
  'wonder',
  4,
  '3–7',
  'garden',
  false,
  'published',
  '[{"text":"In the beginning, God made light shine bright.","scene":"garden"},{"text":"God filled the sky with sunshine and stars.","scene":"garden"},{"text":"Flowers bloomed, and trees reached for the sky.","scene":"garden"},{"text":"Little fish splashed, and happy birds sang.","scene":"garden"},{"text":"God made people to love and care for creation.","scene":"garden"},{"text":"God saw everything and said it was very good.","scene":"garden"}]',
  '[{"question":"Who made our wonderful world?","answers":["God","A tiny mouse","A snowman"],"correctIndex":0},{"question":"How can we care for creation?","answers":["Leave litter","Be gentle with living things","Break flowers"],"correctIndex":1}]'
),
(
  '55555555-5555-4555-8555-555555555555',
  'Jonah & the Big Fish',
  'Jonah 1–3',
  'A very big fish. An even bigger second chance.',
  'kindness',
  4,
  '3–7',
  'sea',
  false,
  'published',
  '[{"text":"God had an important job for Jonah.","scene":"sea"},{"text":"But Jonah sailed the other way instead.","scene":"sea"},{"text":"A big fish gave Jonah a safe place.","scene":"sea"},{"text":"Jonah prayed, and God heard every word.","scene":"sea"},{"text":"On dry land, Jonah tried again.","scene":"sea"},{"text":"God gives us love and fresh starts, too.","scene":"sea"}]',
  '[{"question":"What did Jonah do inside the fish?","answers":["He prayed","He rode a bicycle","He baked cookies"],"correctIndex":0},{"question":"What can we do after a mistake?","answers":["Never try again","Try again with love","Give up forever"],"correctIndex":1}]'
),
(
  '66666666-6666-4666-8666-666666666666',
  'Brave Little David',
  '1 Samuel 17',
  'Little people can have the biggest courage.',
  'courage',
  3,
  '3–7',
  'courage',
  false,
  'published',
  '[{"text":"David was a shepherd with a brave little heart.","scene":"courage"},{"text":"He cared for his sheep every single day.","scene":"courage"},{"text":"One day, his friends faced a very big problem.","scene":"courage"},{"text":"David remembered that God was always with him.","scene":"courage"},{"text":"With courage and faith, David helped his friends.","scene":"courage"},{"text":"You can be brave and kind, too.","scene":"courage"}]',
  '[{"question":"Who did David care for?","answers":["His sheep","A robot","A dragon"],"correctIndex":0},{"question":"What helped David be brave?","answers":["Being unkind","Knowing God was with him","Hiding forever"],"correctIndex":1}]'
)
on conflict (id) do nothing;
