
# Processing:
# 1) Choose a min word length for the game, call it m
# 2) Find longest word in word list, call its length M
# 3) Create 'words_length_N' sqlite tables for N= m to M
# 4) Add each word W from word list into 'words_length_[len(W)]' IF len(W)>=m
# 5) Create 'trigrams' table w/ columns called 'run_start', 'run_length',
#    'used_in_game', and 'num_words_length_N' for each N= m to M
# 6) Do Step (7) for each N from m to M
# 7) Do Step (8) for each word W in 'words_length_N' table
# 8) Do Step (9) for each trigram T contained in W
# 9) A) If T not in 'trigrams' table:
#         - Add T, with 'num_words_length_N'=1, 'run_start'=N, 'run_length'=1
#    B) Else (T already in 'trigrams' table):
#         - Increment 'num_words_length_N' by 1
#         - Increment 'run_length' IF it currently equals (N - 'run_start')
