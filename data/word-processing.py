
# Processing:
# 1) Choose a min word length for the game, call it m
# 2) Find longest word in word list, call its length M
# 3) Create 'words-length-N' tables for N= m to M
# 4) Add each word W from word list into 'words-length-[len(W)]'
# 5) Create 'trigrams' table w/ columns called 'run-start', 'run-length',
#    and 'num-words-length-N' for each N= m to M
# 6) Do Step (7) for each N from m to M
# 7) Do Step (8) for each word W in 'words-length-N' table
# 8) Do Step (9) for each trigram T that makes up W
# 9) A) If T not in 'trigrams' table:
#         - Add T, with 'num-words-length-N'=1, 'run-start'=N, 'run-length'=1
#    B) Else (T already in 'trigrams' table):
#         - Increment 'num-words-length-N' by 1
#         - Increment 'run-length' IF it currently equals (N - 'run-start')
