package com.dalin.hosting.domain.program.menu;

import com.chequer.axboot.core.domain.base.AXBootJPAQueryDSLRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MenuRepository extends AXBootJPAQueryDSLRepository<Menu, Long> {
}
