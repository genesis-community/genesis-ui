import LandingHero from "../assets/images/landingHero.png"

const LandingPageSteps = []

for(let i = 0; i < 3; i++){
    LandingPageSteps.push({
        title: "How to use Genesis?",
        image: LandingHero,
        description: <p>This is step {i+1}</p>
    })
}

export default LandingPageSteps