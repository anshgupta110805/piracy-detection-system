import networkx as nx
from collections import defaultdict

class ThreatGraph:
    def __init__(self):
        self.graph = nx.Graph()

    def build_and_detect(self, logs):
        """
        TASK 6: Model IPs as nodes, shared targeted actions as edges.
        Detect clusters of 3+ IPs behaving similarly.
        """
        self.graph.clear()
        
        # Group IPs by similar behavior (action and purpose)
        behavior_map = defaultdict(set)
        for log in logs:
            ip = log.get("ip_address")
            if not ip: continue
            
            behavior_key = (log.get("action"), log.get("intent"))
            behavior_map[behavior_key].add(ip)
            
            if ip not in self.graph:
                self.graph.add_node(ip, type="IP")

        # Create edges between IPs that share exactly the same behavior
        for behavior, ips in behavior_map.items():
            ips_list = list(ips)
            for i in range(len(ips_list)):
                for j in range(i + 1, len(ips_list)):
                    ip1, ip2 = ips_list[i], ips_list[j]
                    if self.graph.has_edge(ip1, ip2):
                        self.graph[ip1][ip2]['weight'] += 1
                        self.graph[ip1][ip2]['behaviors'].add(behavior)
                    else:
                        self.graph.add_edge(ip1, ip2, weight=1, behaviors={behavior})

        # Detect coordinated clusters (Cliques of size >= 3 or connected components)
        # We will extract components where weight >= threshold or use cliques
        clusters = []
        # Find all cliques
        cliques = list(nx.find_cliques(self.graph))
        for clique in cliques:
            if len(clique) >= 3:
                clusters.append({
                    "cluster_ips": clique,
                    "size": len(clique),
                    "coordinated": True
                })
        
        # Deduplicate clusters (simple approach: sort and convert to tuple)
        unique_clusters = []
        seen = set()
        for c in clusters:
            sig = tuple(sorted(c["cluster_ips"]))
            if sig not in seen:
                seen.add(sig)
                unique_clusters.append(c)

        return unique_clusters

threat_graph_analyzer = ThreatGraph()
