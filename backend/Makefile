CC = gcc
CXX = g++
CFLAGS = -O2
CXXFLAGS = -std=c++17 -Wall -O2 -Ithird_party
LIBS = -lws2_32

TARGET = server.exe

all: $(TARGET)

sqlite3.o: third_party/sqlite/sqlite3.c
	$(CC) $(CFLAGS) -c third_party/sqlite/sqlite3.c -o sqlite3.o

$(TARGET): main.cpp database.cpp sqlite3.o
	$(CXX) $(CXXFLAGS) main.cpp database.cpp sqlite3.o -o $(TARGET) $(LIBS)

clean:
	rm -f $(TARGET) *.o *.db
