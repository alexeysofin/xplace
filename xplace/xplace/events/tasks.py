import dramatiq

from xplace.base import actor

@dramatiq.actor(actor_class=actor.Actor, store_results=True)
def test():
    return 1