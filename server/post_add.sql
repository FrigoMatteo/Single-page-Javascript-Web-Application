BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "users" (
	"id"	INTEGER,
	"name" TEXT NOT NULL,
	"email" TEXT NOT NULL UNIQUE,
	"password" TEXT NOT NULL,
	"salt" TEXT NOT NULL,
	"secret" TEXT DEFAULT (''),
	-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	-- The admin value isn't as foundamental as I though at beginning.
	-- In fact, since admin are the only one using "secret" not empty, we check
	-- that value to understand if it's admin or not. "admin" attribute of the table
	-- would be more foundamental if all users can use 2FA and we need to distinguish them
	-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	"admin" INTEGER NOT NULL DEFAULT (0),
	PRIMARY KEY("id" AUTOINCREMENT) 
);
CREATE TABLE IF NOT EXISTS "posts" (
    "id" INTEGER,
	"title"	TEXT NOT NULL UNIQUE,
	"idAuthor" INTEGER NOT NULL,
	"text" TEXT NOT NULL,
	"maxComments" INTEGER DEFAULT (0),
	"commentsAnonymous" INTEGER DEFAULT (0),
    "commentsNumber" INTEGER DEFAULT (0),
    "timestamp" TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT) 
	FOREIGN KEY("idAuthor") REFERENCES "users"("id")
);

CREATE TABLE IF NOT EXISTS "comments" (
	"id"	INTEGER,
	"text"	TEXT NOT NULL,
	"timestamp" TEXT NOT NULL,
    "idAuthor" INTEGER NOT NULL, --Here we don't assign a foreing key, since it can be anonymous (so it may not exists, such as "-1" for anonymous)
	"postId" INTEGER,
	PRIMARY KEY("id" AUTOINCREMENT), 
	FOREIGN KEY("postId") REFERENCES "posts"("id") ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS "commentInteresting" (
	"postId" INTEGER,
    "commentId" INTEGER,
    "userId" INTEGER,
    PRIMARY KEY ("postId", "commentId","userId"),
	FOREIGN KEY("postId") REFERENCES "posts"("id"),
	FOREIGN KEY("userId") REFERENCES "users"("id"),
    FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE
);



-- All passwords are "pwd"
INSERT INTO "users" ("name","email","password","salt") VALUES ('John Doe', 'u1@p.it', '306954f0999716b69c82add65331b244346f5238425fe58a7f3b2555c77fbf97', '3b35ee883edd0867c4dc461c5ac60987');
INSERT INTO "users" ("name","email","password","salt") VALUES ('Michael schumacher','u2@p.it', 'cc4e4471c0e6beb9b2a3e4a1cef4bc79983a615ba51d85e1ce85ecd02f5b898c', '3db20ed342fdaf424c468054d066ba1b');
INSERT INTO "users" ("name","email","password","salt","admin","secret") VALUES ('admin1', 'a1@p.it', '93371708f035976f10df2e8045cddfc3c3741659ceac7d1f508355eeef2153f6', '63dc414f9d4be33f4baf5edcf0797d7f',1,'LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "users" ("name","email","password","salt","admin","secret") VALUES ('admin2', 'a2@p.it', '706d39f47722ec257a47f1e2a3ff945cdba251e99d37d60acddc6c0acd55fae0', '4d50c609c15ae20f68e7bc32204dfaa0',1,'LXBSMDTMSP2I5XFXIYRGFVWSFI');
INSERT INTO "users" ("name","email","password","salt") VALUES ('Carlo Magno', 'u3@p.it', 'c3937a93f33ab65860fb86a28293235a83240b6955658f0d9dcd779c026c8ee1', '5989fc489aeba0f798e4245eae04dc5b');



-- POSTS:
INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","commentsAnonymous","commentsNumber","text") VALUES ('Tyrannosaurus',1,10,'2002-04-16 12:40:23', 1,3, 'Like other tyrannosaurids, Tyrannosaurus was a bipedal carnivore with a massive skull balanced by a long, heavy tail. Relative to its large and powerful hind limbs, the forelimbs of Tyrannosaurus were short but unusually powerful for their size, and they had two clawed digits.');
INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","text") VALUES ('Megalodon',1,20,'2020-08-20 8:12:02', 'While regarded as one of the largest and most powerful predators to have ever lived, megalodon is only known from fragmentary remains, and its appearance and maximum size are uncertain. Scientists have argued whether its body form was more stocky or elongated than the modern lamniform sharks. Maximum body length estimates between 14.2 and 24.3 metres (47 and 80 ft) based on various analyses have been proposed, though the modal lengths for individuals of all ontogenetic stages from juveniles to adults are estimated at 10.5 meters (34 ft). Their teeth were thick and robust, built for grabbing prey and breaking bone, and their large jaws could exert a bite force of up to 108,500 to 182,200 newtons (24,390 to 40,960 lbf).');

INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","commentsAnonymous","commentsNumber","text") VALUES ('JavaScript',2,2,'2024-2-16 17:2:43',0,1,'JavaScript, often abbreviated as JS, is a programming language and core technology of the World Wide Web, alongside HTML and CSS. Ninety-nine percent of websites use JavaScript on the client side for webpage behavior. Web browsers have a dedicated JavaScript engine that executes the client code. These engines are also utilized in some servers and a variety of apps. The most popular runtime system for non-browser usage is Node.js.');
INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","commentsAnonymous","commentsNumber","text") VALUES ('Show newline and timestamp',2,10,'2024-2-16 17:4:50',4,7,'Here I show the newline.' || CHAR(10) || ' As you can see.' || CHAR(10) ||' Try by yourself in the creation form.');

INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","commentsAnonymous","commentsNumber","text") VALUES ('Volcano', 3, 15,'2023-10-12 15:30:22',0,1,'A volcano is commonly defined as a vent or fissure in the crust of a planetary-mass object, such as Earth, that allows hot lava, volcanic ash, and gases to escape from a magma chamber below the surface.');
INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","text") VALUES ('Request to users',3,12,'2022-5-4 22:56:11','Hello users,'|| CHAR(10) ||'Our staff has a request to do to you. We need you to send 10$ each to pay for our new coffee machine.'|| CHAR(10) ||'Thank you,'|| CHAR(10) ||'The staff.');

INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","text") VALUES ('Forum rules',4,0,'2000-1-1 01:10:15', 'For this forum there is no rules, or censure against you. All free and follow the anarchy');
INSERT INTO "posts" ("title","idAuthor","maxComments","timestamp","commentsAnonymous","commentsNumber","text") VALUES ('I finished my ideas',4,3,'2003-11-4 20:15:15',0,2, 'I dont know what to write. I am hungry. But here you can see a comment with many interest');



-- COMMENTS: ( They are generated by chatgpt the text of the comments)
-- User id : 1 
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (1,3,'2025-2-16 17:2:43','I always start my day with a cup of coffee and a short walk outside.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (1,8, '2006-11-4 20:15:15', 'I am also hungry'|| CHAR(10) ||'I really mean it.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (1,4, '2024-5-16 17:4:50', 'She studied all night for the final exam, hoping to improve her grade significantly.');


-- User id : 2
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (2,8, '2006-11-4 21:15:15','WOOOWW me toooooo');


-- User id : 3
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (3,4, '2024-5-15 17:4:50','Despite the heavy rain, they decided to continue their hike through the forest and enjoy the adventure.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (3,4, '2024-5-17 17:4:50','He forgot his umbrella at home and ended up getting completely soaked during the unexpected thunderstorm.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (3,1, '2003-5-17 17:4:50','The dog barked loudly when it saw the mailman approaching the front gate with a package.');


-- User id : 4
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (4,1, '2004-5-17 17:4:50','They spent the weekend at a quiet cabin in the mountains, enjoying nature and disconnecting from technology.');


-- User id: 5
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (5,5, '2024-10-12 15:30:22','I would like to conquer a volcano one day');


-- User Anonymous:
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (-1,4, '2024-5-16 12:4:50','I could not believe how fast the week went by; it felt like Monday just happened yesterday.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (-1,4, '2024-5-18 12:4:50','She cooked a delicious dinner for her family, using fresh vegetables from her garden and homemade pasta.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (-1,4, '2024-5-12 12:4:50','Even though the movie had great reviews, I found the plot confusing and the ending disappointing.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (-1,4, '2024-5-16 20:4:50','He promised to help with the project but disappeared right before the deadline without saying anything.');
INSERT INTO "comments" ("idAuthor","postId","timestamp", "text") VALUES (-1,1, '2024-5-17 18:4:50','I am anonymous');


-- Add interest to some comments
INSERT INTO "commentInteresting" ("userId","postId","commentId") VALUES (4,1,14);
INSERT INTO "commentInteresting" ("userId","postId","commentId") VALUES (1,8,2);
INSERT INTO "commentInteresting" ("userId","postId","commentId") VALUES (2,8,2);
INSERT INTO "commentInteresting" ("userId","postId","commentId") VALUES (3,8,2);
INSERT INTO "commentInteresting" ("userId","postId","commentId") VALUES (4,8,2);


COMMIT;