const API = "https://script.google.com/macros/s/AKfycbzbQX2jZVQj-IOhT3zQjyPEwItaQRlkRfr5WydV3C6EpR_8LySzHQurC0BIkudndhyw/exec"


/*
================================
helper request
================================
*/

async function request(url, options = {}) {

    const res = await fetch(url, {
        ...options
    })

    const data = await res.json()

    if (!data.success) {
        // throw new Error(data.error || "API Error")
        return data
    }

    return data
}


/*
================================
SESSION APIs
================================
*/


// CREATE SESSION
export async function createSession(payload) {

    return request(`${API}?action=createSession`, {
        method: "POST",
        body: JSON.stringify(payload)
    })

}


// GET SESSION
export async function getSession(sessionId) {

    const res = await request(
        `${API}?action=getSession&id=${sessionId}`,
        { method: "GET" }
    )

    if (res.success) {
        const data = res.data

        // convert rounds từ sheet array -> object
        if (data.rounds) {

            data.rounds = data.rounds.map(r => {

                const roundNo = r[0]
                const dealer = r[1]

                const scores = {}

                data.players.forEach((p, i) => {
                    scores[p] = r[i + 2] ?? 0
                })

                return {
                    round: roundNo,
                    dealer: dealer,
                    scores: scores
                }

            })

        }
    }

    return res

}


// GET TOTALS
export async function getTotals(sessionId) {

    return request(
        `${API}?action=getTotals&id=${sessionId}`,
        {
            method: "GET"
        }
    )

}

/*
================================
ROUND APIs
================================
*/

// ADD ROUND
export async function addRound(payload) {

    return request(`${API}?action=addRound`, {
        method: "POST",
        body: JSON.stringify(payload)
    })

}


// UPDATE ROUND
export async function updateRound(payload) {

    return request(`${API}?action=updateRound`, {
        method: "POST",
        body: JSON.stringify(payload)
    })

}


// DELETE ROUND
export async function deleteRound(payload) {

    return request(`${API}?action=deleteRound`, {
        method: "POST",
        body: JSON.stringify(payload)
    })

}