from typing import List, Dict

def select_strategy(ticker: str, shares: int, price: float, risk_level: str, options_chain: List[Dict]) -> Dict:
    expiry = get_nearest_expiry(options_chain)

    if risk_level == "Low":
        return build_collar_strategy(price, expiry, options_chain, shares)
    elif risk_level == "Medium":
        return build_protective_put(price, expiry, options_chain, shares)
    else:
        return build_covered_call(price, expiry, options_chain, shares)

def get_nearest_expiry(chain: List[Dict]) -> str:
    expiries = sorted({opt['expiry'] for opt in chain})
    return expiries[0] if expiries else ""

def build_protective_put(price, expiry, chain, shares):
    puts = [
        opt for opt in chain 
        if opt['type'] == 'put' and opt['expiry'] == expiry and opt['volume'] > 50 and -0.5 < opt['delta'] < -0.2
    ]
    puts.sort(key=lambda x: abs(x['strike'] - price))
    
    if not puts:
        return {"error": "No suitable put found"}

    put = puts[0]
    cost = put['ask']
    return {
        "strategy": "Protective Put",
        "strike": put['strike'],
        "expiry": put['expiry'],
        "cost": round(cost * shares, 2),
        "max_loss": round((price - put['strike'] + cost) * shares, 2),
        "breakeven": round(price + cost, 2)
    }

def build_collar_strategy(price, expiry, chain, shares):
    put = build_protective_put(price, expiry, chain, shares)
    
    # Return early if protective_put failed
    if "error" in put:
        return put

    calls = [
        opt for opt in chain 
        if opt['type'] == 'call' and opt['expiry'] == expiry and opt['volume'] > 50 and 0.2 < opt['delta'] < 0.4
    ]
    calls.sort(key=lambda x: x['strike'])

    if not calls:
        return {"error": "No suitable call found"}

    call = calls[0]
    put_cost = put['cost'] / 100
    call_credit = call['bid']
    net_cost = round((put_cost - call_credit) * 100, 2)

    return {
        "strategy": "Collar",
        "put_strike": put['strike'],
        "call_strike": call['strike'],
        "expiry": expiry,
        "cost": net_cost,
        "max_loss": round((price - put['strike'] + net_cost/100) * shares, 2),
        "max_gain": round((call['strike'] - price - net_cost/100) * shares, 2)
    }

def build_covered_call(price, expiry, chain, shares):
    calls = [
        opt for opt in chain 
        if opt['type'] == 'call' and opt['expiry'] == expiry and opt['volume'] > 50 and 0.2 < opt['delta'] < 0.5
    ]
    calls.sort(key=lambda x: x['strike'])

    if not calls:
        return {"error": "No suitable call found"}

    call = calls[0]
    return {
        "strategy": "Covered Call",
        "strike": call['strike'],
        "expiry": call['expiry'],
        "premium": round(call['bid'] * shares, 2),
        "max_gain": round((call['strike'] - price + call['bid']) * shares, 2),
        "protection": round(call['bid'], 2)
    }
