
module.exports = {
    async pasaratree() {
    try {
        var arr = [
            { text: "text3", id: "3", parentId: "2" },
            { text: "text2", id: "2", parentId: "1" },
            { text: "text4", id: "4", parentId: "1" },
            { text: "text1", id: "1", /* no parent id */ },
            { text: "text5", id: "5", /* no parent id */ }
        ], data = arr.reduce(function (r, a) {
            function getParent(s, b) {
                return b.id === a.parentId ? b : (b.nodes && b.nodes.reduce(getParent, s));
            }

            var index = 0, node;
            if ("parentId" in a) {
                node = r.reduce(getParent, {});
            }
            if (node && Object.keys(node).length) {
                node.nodes = node.nodes || [];
                node.nodes.push(a);
            } else {
                while (index < r.length) {
                    if (r[index].parentId === a.id) {
                        a.nodes = (a.nodes || []).concat(r.splice(index, 1));
                    } else {
                        index++;
                    }
                }
                r.push(a);
            }
            return r;
        }, []);

        console.log("<pre>" + JSON.stringify(data, 0, 4) + "</pre>");
    } catch {
        return null;
    }
    }
};