// Go version of the test server, for the containers track.
package main

import (
	"encoding/json"
	"log"
	"math/rand"
	"net/http"
	"time"
)

func handler(numbers []int) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		time.Sleep(time.Duration(rand.Intn(550)) * time.Millisecond)
		if rand.Intn(100) < 10 {
			http.Error(w, "service unavailable", http.StatusServiceUnavailable)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string][]int{"numbers": numbers})
	}
}

func main() {
	http.HandleFunc("/primes", handler([]int{2, 3, 5, 7, 11, 13}))
	http.HandleFunc("/fibo", handler([]int{1, 1, 2, 3, 5, 8, 13, 21}))
	http.HandleFunc("/odd", handler([]int{1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23}))
	http.HandleFunc("/rand", handler([]int{5, 17, 3, 19, 76, 24, 1, 5, 10, 34, 8, 27, 7}))
	log.Println("test server on :8090")
	log.Fatal(http.ListenAndServe(":8090", nil))
}
