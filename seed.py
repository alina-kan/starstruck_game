from app import app, db
from models import Character

characters = [
    Character(name="Orion", description="A stoic archer whose aloofness leaves more questions than answers.", image_url="/images/orion.png"),
    Character(name="Verena", description="A shy and bright bookworm whose nose is always stuck in a romance novel.", image_url="/images/verena.png"),
    Character(name="Markos", description="A cold ice skater who won't let anyone stand in his way .", image_url="/images/markos.png"),
]

with app.app_context():
    db.session.add_all(characters)
    db.session.commit()
    print("✅ Characters seeded successfully!")
