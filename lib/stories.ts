import { Story } from './types';

export const STORIES: Story[] = [
  {
    id: '11111111-1111-4111-8111-111111111111', title: "Noah’s Big Adventure", verse: 'Genesis 6–9', description: 'A little faith. A big boat. A beautiful promise.', theme: 'trust', minutes: 3, ageGroup: '3–7', coverScene: 'ark', isFree: true, status: 'published',
    pages: [
      {text: 'God asked Noah to build a very big boat.', scene: 'ark'},
      {text: 'Noah trusted God and got to work.', scene: 'ark'},
      {text: 'Two by two, the animals climbed aboard.', scene: 'ark'},
      {text: 'Rain pattered softly. Everyone stayed safe inside.', scene: 'ark'},
      {text: 'At last, a little dove found a green leaf.', scene: 'ark'},
      {text: 'God painted a rainbow: a promise of love.', scene: 'ark'},
      {text: 'God cares for you, through sunshine and rain.', scene: 'ark'}
    ],
    quiz: [{question: 'What did Noah build?', answers: ['A big boat', 'A tall castle', 'A racing car'], correctIndex: 0}, {question: 'What did the rainbow remind Noah of?', answers: ['A tasty snack', 'God’s loving promise', 'A new toy'], correctIndex: 1}]
  },
  {
    id: '22222222-2222-4222-8222-222222222222', title: 'The Little Lost Sheep', verse: 'Luke 15:3–7', description: 'Even the littlest lamb is loved a whole lot.', theme: 'love', minutes: 3, ageGroup: '3–7', coverScene: 'sheep', isFree: true, status: 'published',
    pages: ['A fluffy little sheep wandered far from home.', 'Soon, the little sheep felt all alone.', 'The kind shepherd noticed one sheep was missing.', 'He searched the hills until he heard a baa.', 'He carried the little sheep safely home.', 'You are precious to God, just like that sheep.'].map(text=>({text,scene:'sheep'})),
    quiz: [{question:'Who looked for the little sheep?',answers:['A kind shepherd','A sleepy fish','A busy bee'],correctIndex:0},{question:'How does God feel about you?',answers:['He forgets me','He loves me very much','He is too busy'],correctIndex:1}]
  },
  {
    id: '33333333-3333-4333-8333-333333333333', title: 'A Sky Full of Promises', verse: 'Genesis 15:1–6', description: 'Look up! God has wonderful things in store.', theme: 'wonder', minutes: 3, ageGroup: '3–7', coverScene: 'stars', isFree: true, status: 'published',
    pages: ['Abraham looked up at the twinkling night sky.', 'God said, “Can you count all those stars?”', 'Abraham tried, but there were far too many!', 'God promised Abraham a great big family.', 'Abraham trusted God, even while he waited.', 'God keeps his promises, one beautiful day at a time.'].map(text=>({text,scene:'stars'})),
    quiz:[{question:'What did Abraham look at?',answers:['Shiny stars','Green apples','Red balloons'],correctIndex:0},{question:'What can we remember when we wait?',answers:['Promises never matter','God keeps his promises','We are alone'],correctIndex:1}]
  },
  {
    id:'44444444-4444-4444-8444-444444444444',title:'A World Full of Wonder',verse:'Genesis 1',description:'Every flower, every creature, made with love.',theme:'wonder',minutes:4,ageGroup:'3–7',coverScene:'garden',isFree:false,status:'published',
    pages: [], quiz: []
  },
  {
    id:'55555555-5555-4555-8555-555555555555',title:'Jonah & the Big Fish',verse:'Jonah 1–3',description:'A very big fish. An even bigger second chance.',theme:'kindness',minutes:4,ageGroup:'3–7',coverScene:'sea',isFree:false,status:'published',
    pages: [], quiz: []
  },
  {
    id:'66666666-6666-4666-8666-666666666666',title:'Brave Little David',verse:'1 Samuel 17',description:'Little people can have the biggest courage.',theme:'courage',minutes:3,ageGroup:'3–7',coverScene:'courage',isFree:false,status:'published',
    pages: [], quiz: []
  }
];

export const STICKER_NAMES = ['Rainbow promise','Little lamb','Starry night','Wonderful world','Big blue friend','Brave heart','Sunshine smile','Kindness flower','Moonbeam','Happy dove','Little explorer','Golden heart','Sleepy cloud','Gentle lion','Tiny sprout','Faithful friend','Peaceful sea','Joyful song','Little shepherd','Bright butterfly','Love grows','Happy camper','Good listener','Dream big','Helping hands','Cozy home','Brave bear','Hope shines','Grateful heart','Super reader'];
