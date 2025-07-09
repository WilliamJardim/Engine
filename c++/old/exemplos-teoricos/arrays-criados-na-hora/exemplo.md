# JavaScript
<code>
function getColors(alpha) {
    return [
        [1, 0, 0, alpha],
        [0, 1, 0, alpha]
    ];
}
</code>

# C++
<code>
#include <array>

std::array<std::array<float, 4>, 2> getColors(float alpha) {
    return {{
        {1, 0, 0, alpha},
        {0, 1, 0, alpha}
    }};
}
</code>

# OUTRA POSSIBILIDADE 
<code>
#include <vector>

std::vector<std::vector<float>> getFaceColors(float nivelTransparencia) {
    return {
        {1, 0, 0, nivelTransparencia},
        {0, 1, 0, nivelTransparencia},
        {0, 0, 1, nivelTransparencia},
        {1, 1, 0, nivelTransparencia},
        {1, 0, 1, nivelTransparencia},
        {0, 1, 1, nivelTransparencia}
    };
}
</code>